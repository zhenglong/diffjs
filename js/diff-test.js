test("QuickSort-basic", function() {
	var arr = [100, 3, -4, 2, 9, 99];
	window.util.QuickSort(arr, 0, arr.length - 1, function(v1, v2) {
		if (v1 < v2) return -1;
		else if (v1 == v2) return 0;
		else return 1;
	});
	deepEqual(arr, [-4, 2, 3, 9 , 99, 100]);
});
test("QuickSort-long", function() {
	var arr = [100, 3, -4, 2, 9, 99,10, 3, 200, 2, 9, 99];
	window.util.QuickSort(arr, 0, arr.length - 1, function(v1, v2) {
		if (v1 < v2) return -1;
		else if (v1 == v2) return 0;
		else return 1;
	});
	deepEqual(arr, [-4, 2, 2, 3, 3, 9, 9, 10, 99, 99, 100, 200]);
});
test("BinarySearch", function() {
	var arr = [-4, 2, 3, 9 , 99, 100];
	var item = window.util.BinarySearch(arr, -4, function(v1, v2) {
		if (v1 < v2) return -1;
		else if (v1 == v2) return 0;
		else return 1;
	});
	equal(item, 0, "successful to find -4");
	item = window.util.BinarySearch(arr, 99, function(v1, v2) {
		if (v1 < v2) return -1;
		else if (v1 == v2) return 0;
		else return 1;
	});
	equal(item, 4, "successful to find 99");
	item = window.util.BinarySearch(arr, 100, function(v1, v2) {
		if (v1 < v2) return -1;
		else if (v1 == v2) return 0;
		else return 1;
	});
	equal(item, 5, "successful to find 100");
	item = window.util.BinarySearch(arr, 200, function(v1, v2) {
		if (v1 < v2) return -1;
		else if (v1 == v2) return 0;
		else return 1;
	});
	equal(item, null, "should be failed to find 200");
});
test("Hash", function() {
	var str = "To perform an insertion sort, begin at the left-most element of the array"
	var h = window.util.Hash(0, str);
	equal(h, 509590277);
	str = "To perform an element of the insertion sort, begin at";
	h = window.util.Hash(0, str);
	equal(h, -1635033231);
});


test("Diff-basic", function() {
	var lines0 = ["a", "b", "c", "ba", "e"];
	var lines1 = ["a", "b", "ba", "e"];
	var output = [];
	$.each(window.util.Diff(lines0, lines1), function(index, candidate) {
		if (candidate.a > 0 && candidate.a <= lines0.length) 
			output.push(lines0[candidate.a - 1]);
	});
	deepEqual(output, ["a", "b", "ba", "e"]);
});

test("Diff-long", function() {
	var lines0 = ['test("Diff-basic", function() {', 'var lines0 = ["a", "b", "c", "ba", "e"];',
	'var output = window.util.Diff(lines0, lines1);', 'var output = window.util.Diff(lines0, lines1);'];
	var lines1 = ['test("Diff-basic", function() {', 'var lines1 = ["a", "b", "d", "ba", "e"];',
	'var output = window.util.Diff(lines0, lines1);'];
	var output = [];
	$.each(window.util.Diff(lines0, lines1), function(index, candidate) {
		if (candidate.a > 0 && candidate.a <= lines0.length) 
			output.push(lines0[candidate.a - 1]);
	});
	deepEqual(output, ['test("Diff-basic", function() {', 'var output = window.util.Diff(lines0, lines1);']);
});

test("Diff-long-reverse", function() {
	var lines1 = ['test("Diff-basic", function() {', 'var lines0 = ["a", "b", "c", "ba", "e"];',
	'var output = window.util.Diff(lines0, lines1);', 'var output = window.util.Diff(lines0, lines1);'];
	var lines0 = ['test("Diff-basic", function() {', 'var lines1 = ["a", "b", "d", "ba", "e"];',
	'var output = window.util.Diff(lines0, lines1);'];
	var output = [];
	$.each(window.util.Diff(lines0, lines1), function(index, candidate) {
		if (candidate.a > 0 && candidate.a <= lines0.length) 
			output.push(lines0[candidate.a - 1]);
	});
	deepEqual(output, ['test("Diff-basic", function() {', 'var output = window.util.Diff(lines0, lines1);']);
});

test("Diff-long-2", function() {
	var lines0 = ['test("Diff-basic", function() {', 'var lines0 = ["a", "b", "c", "ba", "e"];',
	'var output = window.util.Diff(lines0, lines1);', 'var output = window.util.Diff(lines0, lines1);'];
	var lines1 = ['var lines1 = ["a", "b", "d", "ba", "e"];', 'test("Diff-basic", function() {',
	'var output = window.util.Diff(lines0, lines1);', 'test("Diff-basic", function() {'];
	var output = [];
	$.each(window.util.Diff(lines0, lines1), function(index, candidate) {
		if (candidate.a > 0 && candidate.a <= lines0.length) 
			output.push(lines0[candidate.a - 1]);
	});
	deepEqual(output, ["test(\"Diff-basic\", function() {", "var output = window.util.Diff(lines0, lines1);"]);
});

test("Diff-long-2-reverse", function() {
	var lines1 = ['test("Diff-basic", function() {', 'var lines0 = ["a", "b", "c", "ba", "e"];',
	'var output = window.util.Diff(lines0, lines1);', 'var output = window.util.Diff(lines0, lines1);'];
	var lines0 = ['var lines1 = ["a", "b", "d", "ba", "e"];', 'test("Diff-basic", function() {',
	'var output = window.util.Diff(lines0, lines1);', 'test("Diff-basic", function() {'];
	var output = [];
	$.each(window.util.Diff(lines0, lines1), function(index, candidate) {
		if (candidate.a > 0 && candidate.a <= lines0.length) 
			output.push(lines0[candidate.a - 1]);
	});
	deepEqual(output, ["test(\"Diff-basic\", function() {", "var output = window.util.Diff(lines0, lines1);"]);
});

test("Diff-sample", function() {
	var lines0 = ["a", "b", "c", "a", "b", "b", "a"],
	lines1 = ["c", "b", "a", "b", "a", "c"];
	var output=[];
	$.each(window.util.Diff(lines0, lines1), function(index, candidate) {
		if (candidate.a > 0 && candidate.a <= lines0.length) 
			output.push(lines0[candidate.a - 1]);
	});
	deepEqual(output, ["c", "a", "b", "a"]);
});

test("DiffString", function() {
	var result = window.util.DiffString("12345", "135");
	equal(result, "1<del>2</del>3<del>4</del>5", "basical test of DiffString: 12345 and 135");
});

test("DiffString", function() {
	var result = window.util.DiffString("1234578", "ab1365");
	equal(result, "<ins>ab</ins>1<del>2</del>3<del>4</del><ins>6</ins>5<del>7</del><del>8</del>", "test of DiffString: 1234578 and ab1365");
});

test("hsvToRgb", function() {
	var vec = window.util.hsvToRgb(0.011111111, 0.2, 0.9);
	var result = window.util.rgbVectorToWebColor(vec);
	equal(result, "#e6bbb8", "0.011111111 0.2 0.9 => #e6bbb8");
});
