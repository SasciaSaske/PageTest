var select = document.getElementById("countrySelect");

d3.csv("CountryZone.csv").then(function(datas)
{
    for(var i = 0; i < datas.length; i++)
    {
        var data = datas[i];
        var option = document.createElement("option");
        option.textContent = data.Country;
        option.value = JSON.stringify({Code: data.Code, Zone: data.Zone});
        select.appendChild(option);
    }
});

function getShippingZone()
{
    var countryError = "Please select your Country!";
    var zipError = "Please enter your Postal Code!";

    var zones = [
		["2","3","4","8"],
		["5","UK"],
		["41","42","12"],
		["9"],
		["10"],
		["6","11"]
		];

	var names = ["EUR1+NA","EUR2+UK","EUR3","ROW1","ROW2","ROW3"];

	var obj = JSON.parse(select.value);
	var code = obj.Code;
	var zone = obj.Zone;
	var zip = document.getElementById("zipCode").value.split('-')[0].toUpperCase();

	if(code == "none")
	{
		document.getElementById("result").innerHTML = countryError;
		return;
	}	

	if(code == "CA")
		zip = zip.replace(/\s+/g, '');

	var isSurcharged = false;

	d3.csv("CountryZip.csv").then(function(datas)
  {
		for(var i = 0; i < datas.length; i++)
		{
			var data = datas[i];

			if(data.Code == code)
			{
				if(data.ZipLow != "" && zip == "")
				{
					document.getElementById("result").innerHTML = zipError;
					return;
				}

      			if(code == "GB")
        		{
					var lowZip = data.ZipLow.split(/(\d+)/);
					var highZip = data.ZipHigh.split(/(\d+)/);
					var myZip = zip.split(' ')[0].split(/(\d+)/);

        			if(lowZip[0] == myZip[0] &&
					(lowZip.length == 1 ||
					(parseInt(lowZip[1]) <= parseInt(myZip[1]) && parseInt(myZip[1]) <= parseInt(highZip[1]))))
					{
						isSurcharged = true;
						break;
					}
        		}
      			else if(code == "CA")
        		{
					var lowZip = "";
					var highZip = "";
					var myZip = "";

					for(var j = 0; j < 6; j++)
					{
						if(j%2==0)
						{
							lowZip += (parseInt(data.ZipLow[j], 36) - 9).toLocaleString('en-US', {minimumIntegerDigits: 2});
							highZip += (parseInt(data.ZipHigh[j], 36) - 9).toLocaleString('en-US', {minimumIntegerDigits: 2});
							myZip += (parseInt(zip[j], 36) - 9).toLocaleString('en-US', {minimumIntegerDigits: 2});}
						else
						{
							lowZip += data.ZipLow[j];
							highZip += data.ZipHigh[j];
							myZip += zip[j];
						}
					}

					if(parseInt(lowZip) <= parseInt(myZip) && parseInt(myZip) <= parseInt(highZip))
					{
						isSurcharged = true;
						break;
					}

        		}
      			else if(data.ZipLow == "" || (parseInt(data.ZipLow) <= zip && zip <= parseInt(data.ZipHigh)))
				{
					isSurcharged = true;
					break;
				}
			}
		}

		var variationName;

		for(var i = 0; i < zones.length; i++)
		{
			if(zones[i].includes(zone))
			{
				variationName = names[i];
			}
		}

		if(isSurcharged)
    	{
			variationName += " NON-URBAN";
		}

		document.getElementById("result").innerHTML = variationName;
	});
}