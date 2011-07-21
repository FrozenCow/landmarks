var latlng = function(x,y,z) { return dynmap.getProjection().fromLocationToLatLng(new Location(undefined, x,y,z)); }

componentconstructors['landmarks'] = function(dynmap, configuration) {
	var markers = {};
	
	var link = $("<link>");
	link.attr({
		type: 'text/css',
		rel: 'stylesheet',
		href: 'css/landmarks.css'
	});
	$("head").append( link ); 
	
	$(dynmap).bind('worldupdating', function() {
		$.getJSON('markers.json', function(data) {
			// Set all markers to outdated
			$.each(markers, function(key, value) {
				markers[key]['outdated'] = true;
			});
			
			for(i = 0; i < data.length; i++)
			{
				var name = data[i].name;
				if(markers[name])
				{
					var markerPosition = latlng(data[i].x, data[i].y, data[i].z);
					markers[name]['outdated'] = false;
					markers[name]['marker'].setLatLng(markerPosition);
					markers[name]['data'] = data[i];
					$(markers[name]['marker']._element).toggle(dynmap.world.name === data[i].world);
				}
				else
				{
					markers[name] = {}
					markers[name]['data'] = data[i];
					markers[name]['marker'] = createMarker(data[i]);
					$(markers[name]['marker']._element).toggle(dynmap.world.name === data[i].world);
					dynmap.map.addLayer(markers[name]['marker']);
				}
			}
			
			// Remove markers that are still outdated
			$.each(markers, function(key, value) {
				if(markers[key]['outdated'] === true)
				{
					dynmap.map.removeLayer(markers[key]['marker']);
					delete markers[key];
				}
			});
		});
	});
	
	$(dynmap).bind('mapchanged', function() {
		for(var name in markers)
		{
			var data = markers[name]['data'];
			var markerPosition = latlng(data.x, data.y, data.z);
			markers[name]['marker'].setLatLng(markerPosition);
			$(markers[name]['marker']._element).toggle(dynmap.world.name == data.world);
		}
	});
	
	if(typeof(addSettingsPanel) == 'function')
	{
		addSettingsPanel('Landmarks', [
			{'name': 'showmarkers', 'label': 'Show markers', 'type': 'checkbox', 'value': 1, 'onchange': onShowMarkers},
			{'name': 'showtext', 'label': 'Show text', 'type': 'radio', 'value': 'Popup', 'values': ['Never', 'Popup', 'Always'], 'onchange': onShowText}
		]);
	}
}

function createMarker(data)
{
	var markerPosition = latlng(data.x, data.y, data.z);
	return new L.CustomMarker(markerPosition, { elementCreator: function() {
		return $('<div/>')
			.addClass('Marker')
			.addClass('landmarkMarker')
			.append($('<span/>')
				.addClass('landmarkName')
				.text(data.name))
			[0];
	}});
}

function onShowMarkers()
{
	if($(this).is(':checked'))
	{
		$('#mcmap').removeClass('landmarks-hidden');
	}
	else
	{
		$('#mcmap').addClass('landmarks-hidden');
	}
}

function onShowText()
{
	var value = $(this).parent().find('input:checked').val();
	switch(value)
	{
		case 'Never':
			$('#mcmap').removeClass('landmarks-text-always');
			$('#mcmap').addClass('landmarks-text-never');
			break;
		case 'Popup':
			$('#mcmap').removeClass('landmarks-text-always');
			$('#mcmap').removeClass('landmarks-text-never');
			break;
		case 'Always':
			$('#mcmap').addClass('landmarks-text-always');
			$('#mcmap').removeClass('landmarks-text-never');
			break;
	}
}
