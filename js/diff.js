(function(window, $) {
	var util = window.util = (window.util || {});
	if ($ == null) {
		$ = {};
		$.each = function(obj, callback) {
			for (var index = 0; index < obj.length; index++) {
				callback(index, obj[index]);
			}
		}
	}
	
	util.QuickSort = function(arr, left, right, comparer) {
		function Partition(l, r, pivot) {
			if ((r - l) < 10) {
				// Use insert sorting instead
			}
			var pivotValue = arr[pivot];
			Swap(pivot, r);
			pivot = r;
			while (l < r) {
				while (l < r && comparer(arr[l], pivotValue) == -1)l++;
				while (l < r && comparer(arr[r], pivotValue) != -1)r--;
				if (l < r) Swap(l, r);
			}
			Swap(pivot, l);
			return l;
		}
		function Swap(i, j) {
			if (i == j) return;
			var temp = arr[i];
			arr[i] = arr[j];
			arr[j] = temp;
		}
		if (left < right) {
			if (right - left < 5) {
				// use insertion sort
				var item, iHole;
				for (var i = left + 1; i <= right; i++) {
					item = arr[i];
					iHole = i;
					while (iHole > left && comparer(item, 	arr[iHole - 1]) == -1) {
						arr[iHole] = arr[iHole - 1];
						iHole--;
					}
					arr[iHole] = item;
				}
			} else {
				var pivotIndex = Math.floor((left + right) / 2);
				pivotIndex = Partition(left, right, pivotIndex);
				util.QuickSort(arr, left, pivotIndex - 1, comparer);
				util.QuickSort(arr, pivotIndex + 1, right, comparer);
			}
		}
	};
	util.BinarySearch = function(arr, value, comparer) {
		var high = arr.length - 1;
		var low = 0;
		var mid;
		while (low <= high) {
			mid = Math.floor((low + high) / 2);
			var result = comparer(value, arr[mid]); 
			if (result == 0) {
				return mid;
			} else if (result == -1) {
				high = mid - 1;
			} else {
				low = mid + 1;
			}
		}
		return null;
	}
	// Given a hash value and a new character, return a new hash value
	util.Hash = function(h, str) {
		// Rotate an unsigned value to the left.
		function ROL(v, n) {
			return ((v << n) | v >> (31 - n));
		} 
		$.each(str, function(index, c) {
			h = c.charCodeAt(0) + ROL(h, 7);
		});
		return h;
	};
	util.Diff = function(lines0, lines1) {
		var V = [], // a vector of elements structured (serial, hash), hash value of every line in file2
			E = [], // lists all the equivalence classes of lines in file2
			P = [], // if non-zero, points to the beginning of the class of lines in file2 for every line in file1
			K = [], // a vector of references to candidates (a, b, previous)
			k= 0; // index of last filled element of K
		function Initialize() {
			var index;
			$.each(lines1, function(i, item) {
				V.push({serial: i + 1, hash: util.Hash(0, item)});
			});
			util.QuickSort(V, 0, V.length - 1, function(v1, v2) {
				if (v1.hash < v2.hash || (v1.hash == v2.hash && v1.serial < v2.serial)) {
					return -1;
				} else if (v1.hash == v2.hash && v1.serial == v2.serial) {
					return 0;
				} else if (v1.hash > v2.hash || (v1.hash == v2.hash && v1.serial > v2.serial)) {
					return 1;
				} else {
					throw "invalid opeartion";
				}
			});
			E[V.length - 1] = true;
			for (index = 0; index < (V.length-1); index++) {
				E[index] = (V[index].hash != V[index + 1].hash);
			}
			var hash0;
			$.each(lines0, function(index, item) {
				hash0 = util.Hash(0, item);
				var itemIndex = util.BinarySearch(V, hash0, function(v1, v2) {
					var hash1 = v1.hasOwnProperty("hash") ? v1.hash : v1;
					var hash2 = v2.hasOwnProperty("hash") ? v2.hash : v2;
					if (hash1 == hash2) return 0;
					else if (hash1 > hash2) return 1;
					else return -1;
				});
				if (itemIndex == null) P[index] = null;
				else {
					while (itemIndex >= 0 && V[itemIndex].hash == hash0) itemIndex--;
					P[index] = itemIndex + 1;
				}
			});
			K[0] = {a: 0, b: 0, previous: null};
			K[1] = {a: lines0.length + 1, b: lines1.length + 1, previous: null};
		}
		/*
		 * i - the current index in file1
		 * p - index in E of first element of class of lines in file2 equal to line i of file1  
		 */
		function Merge(i, p) {
			var r = 0, c = K[0], j;
			while (true) {
				j = V[p].serial;
				var mid, low=r, high=k, isFound = false;
				while (low <= high) {
					mid = Math.floor((low + high) / 2);
					if (K[mid].b < j) {
						if (K[mid + 1].b > j) { isFound = true; break; }
						else low = mid + 1;
					} else if (K[mid].b > j) {
						if (K[mid - 1].b < j) { isFound = true; mid = mid - 1; break; }
						else high = mid - 1;
					} else { isFound = false; break; }
				}
				if (isFound && (lines0[i] == lines1[j - 1])) {
					if (K[mid + 1].b > j) {
						K[r] = c;
						r = mid + 1;
						c = { a: i+1, b: j, previous: K[mid] };
					}
					if (mid == k) {
						K[k + 2] = K[k + 1];
						k++;
						break;
					}
				}
				if (E[p]) break;
				p++;
			}
			K[r] = c;
		}
		var output = [];
		var outputCandidates = [];
		function ExcludeJackpot() {
			$.each(K, function(i, candidate) {
				if (candidate.a > 0 && candidate.a <= lines0.length && 
					candidate.b > 0 && candidate.b <= lines1.length) {
						if (lines0[candidate.a - 1] == lines1[candidate.b - 1])
						output.push(lines0[candidate.a - 1]);
						outputCandidates.push(candidate);
					}
			});
		}
		
		Initialize();
		$.each(lines0, function(i, line) {
				if (P[i] != null) Merge(i, P[i]);
		});
		ExcludeJackpot();
		return outputCandidates;// return output;
	};
})(window);

/*
 * string operations
 * 
 */
(function(window) {
	var util = window.util = (window.util || {});
	util.Format = function(formatter, args) {
		var t = $.type(args);
		if (t != "object" && t != "array") {
			args = argument.shift();
		}
		for(var key in args) {
			formatter = formatter.replace(new RegExp("{" + key + "}", "g"), args[key]);
		}
		return formatter;
	};
})(window);

/*
 * File Operations
 */
(function(window) {
	var util = window.util = (window.util || {});
	var fileIO = util.fileIO = (util.fileIO || {});
	fileIO.ReadyState = {
		EMPTY: 0,
		LOADING: 1,
		DONE: 2
	};
	fileIO.onPostRead = function() {
		console.log("event handler onPostRead");
	};
	fileIO.Read = function(file) {
		var reader = new FileReader();
		reader.onload = function() {
			fileIO.onPostRead(reader.result);
		};
		reader.onerror = function() {
			fileIO.onPostRead(reader.error, file);
		}
		reader.readAsText(file);
	};
})(window);
