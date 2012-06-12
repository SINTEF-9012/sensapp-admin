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
		.attr('onclick',"removeElement('"+$('#'+refValue).attr('value')+elementNames+"Row','"+div+"');")
		.text("X");	
	newCell.append(newText);
	newRow.append(newCell);

	$('#'+div).find('tbody').append(newRow);

    }
     
function removeElement(row,div) {
	$('#'+div).find('#'+row).remove();
}