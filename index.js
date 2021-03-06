var filteredTable = [];
var filteredHeader = [];

function rebuildTable(tableData) {
	filteredTable = [];
	filteredHeader = [];
	$.each(tableData.data, function (x, row) {
		var id = row.id_personen;
		// console.log(id);

		addOrUpdateFilteredTable(row);

	});

	$.each(filteredTable, function (x, row) {

		$.each(Object.keys(row), function (x, key) {
			if (filteredHeader.includes(key) == false) {
				filteredHeader.push(key);
			}
		});
	});
}

function addOrUpdateFilteredTable(row) {

	if (row == undefined || row.id_personen == undefined){
		return;
	}
	// console.log("row: ", row);

	var mergeMail = document.getElementById("mergeMail").checked;

	// console.log("Filtered: ", filteredTable);
	var entryExist = false;
	var errPlain = row.erreichbarkeitsart;


	if (mergeMail) {
		if (errPlain.toLowerCase().includes("email")) {
			// if field contains email (e.g. EMail privat, büro...) handle always as "EMail"
			errPlain = "EMail"
		} else if (errPlain.toLowerCase().includes("mobil") || errPlain.toLowerCase().includes("telefon")) {
			// also merge phone-fields
			errPlain = "Tel"
		}
	}

	$.each(filteredTable, function (x, entry) {
		if (row.id_personen == entry.id_personen) {
			var prop = errPlain;
			var i = 0;
			while (entry.hasOwnProperty(prop)) {
				i = i + 1;
				prop = errPlain.toString() + "_" + i.toString();
				//	console.log("NEW: ", prop);
			}

			entry[prop] = row.erreichbarkeit;
			entryExist = true;
			return;
		}
	});
	if (entryExist == true) {
		return;
	}
	// new dataset: create 
	var entry = {};
	entry.standesbuchnummer = row.standesbuchnummer;
	entry.id_personen = row.id_personen;
	entry.zuname = row.zuname;
	entry.vorname = row.vorname;
	entry.dienstgrad = row.dienstgrad;
	entry.status = row.status;

	filteredTable.push(entry);
}




function createTable(tableData, callback) {

	rebuildTable(tableData);
	tableData.data = filteredTable;
	tableData.meta.fields = filteredHeader;

	var table = $('table#jquery-table');
	//	return;
	table.trigger("destroy", [false, function(){
	}]);

	table.empty();
	var table = $('table#jquery-table');
	var thead_tr = $('<tr>');
	$('<td>').text("#").appendTo(thead_tr);
	$.each(tableData.meta.fields, function (x, col_h) {
		$('<td>').text(col_h).appendTo(thead_tr);
	});
	table.append($('<thead>').append(thead_tr));

	var idx = 0;
	var tbody = $('<tbody>');
	$.each(tableData.data, function (x, row) {
		var tr = $('<tr>');
		idx++;
		tr.append($('<td>').text(idx));
		$.each(tableData.meta.fields, function (y, col) {
			tr.append($('<td>').text(row[col]));
		});

		tbody.append(tr);
	});

	table.append(tbody);
	
	callback();
}

var foo = false;
function TableSort() {

	$("#jquery-table").tablesorter({
		theme: 'blue',
		widthFixed: true,
	widgets: ['zebra', 'stickyHeaders' /*, 'filter'*/],
		showProcessing: true,
		widgetOptions: {
			filter_formatter: {
				1: function ($cell, indx) {
					console.log("1 tablesorter.filterFormatter.select2 start");
					return $.tablesorter.filterFormatter.select2($cell, indx, {
						match: false
					});
				},
				2: function ($cell, indx) {
					console.log("2 tablesorter.filterFormatter.select2 start");
					return $.tablesorter.filterFormatter.select2($cell, indx, {
						match: false
					});
				},
			}
		}
	});
	console.log("tablesorter finished");
}


function parseFile() {
	if (document.getElementById("csvInput").files.length == 0) {
		console.log("no files selected");
		return;
	}
	file = document.getElementById('csvInput').files[0];

	Papa.parse(file, {
		download: true,
		header: true,
		// quoteChar: '"',
		complete: function (results) {
			// console.log(results.meta.fields);
			console.log("Parsing complete:", results.data);
			createTable(results, TableSort);
		}
	});
}

function downloadCsv(){
	$('#jquery-table').table2CSV({
		separator : ';',
	});
}