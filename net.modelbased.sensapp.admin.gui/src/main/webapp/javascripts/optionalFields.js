    function addEvent() {
    var ni = document.getElementById('form');
    var numi = document.getElementById('theValue');
    var num = (document.getElementById("theValue").value -1)+ 2;
    numi.value = num;
    var divIdName = "my"+num+"Div";
    var newdiv = document.createElement('tr');
    newdiv.setAttribute("id",divIdName);
    newdiv.innerHTML = '<td><input type="text" class="input-medium search-query" style="width:55px"><b>&nbsp;:</b></td><td><input type="text" class="input-medium search-query">&nbsp;&nbsp;&nbsp;<b class="btn" style="font-size:20px;" onclick="removeElement(\''+divIdName+'\');">&times;</b></td>';
    ni.appendChild(newdiv);
    }
     
    function removeElement(divNum) {
    var d = document.getElementById('form');
    var olddiv = document.getElementById(divNum);
    d.removeChild(olddiv);
    }