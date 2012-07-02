//Make a form field for sensors/composites.
function addEvent(div,elementNames,refValue) {
	
	$('#'+refValue).attr('value',$('#'+refValue).attr('value') + 1);
	var newRow = $(document.createElement('tr'))
		.attr('id',$('#'+refValue).attr('value')+elementNames+'Row');
	var newCell = $(document.createElement('td'))
		.attr('id',$('#'+refValue).attr('value')+elementNames+'Field');
	var newInput = $(document.createElement('input'))
		.attr('type','text')
		.attr('class','input-medium search-query')
		.attr('style','width:55px');
	newCell.append(newInput);
	var newText = $(document.createElement('b'))
		.text(" :");	
	newCell.append(newText);
	newRow.append(newCell);	
	newCell = $(document.createElement('td'))
		.attr('id',$('#'+refValue).attr('value')+elementNames+'Value');
	var newInput = $(document.createElement('input'))
		.attr('type','text')
		.attr('class','input-medium search-query');
	newCell.append(newInput);
	newText = $(document.createElement('b'))
		.attr('class','btn')
		.css("font-size","16px")
		.unbind('click').click(function() {
		 $(this).closest('tr').remove();
		})
		.html("&times;");	
	newCell.append(newText);
	newRow.append(newCell);

	$('#'+div).find('tbody').append(newRow);

    }
     
function removeElement(row,div) {
	$('#'+div).find('#'+row).remove();
}