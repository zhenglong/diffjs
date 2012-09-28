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
	util.DiffString = function(str0, str1) {
		var m = str0.length, n = str1.length;
		var k0 = [], k1 = [], LE = [], LT=[];
		function copyArr(from, to) {
			for(var prop in from) to[prop] = from[prop];
		}
		function forwards(s0, e0, s1, e1) {
			var i, j, k;
			for (i = 0, len = e1 - s1 + 1; i <=len; i++) k1[i] = 0;
			for (i = s0; i <= e0; i++ ) {
				copyArr(k1, k0);
				for (j = s1, k = 0; j <= e1; j++, k++) {
					k1[k + 1] = (str1[j] == str0[i]) ? k0[k] + 1 : Math.max(k1[k], k0[k + 1]);
				}
			}
			copyArr(k1, LE);
		}
		function backwards(s0, e0, s1, e1) {
			var i, j;
			for (i = 0, len = e1 - s1 + 1; i <= len; i++) k1[i] = 0;
			for (i = e0; i >= s0; i-- ) {
				copyArr(k1, k0);
				for (j = e1, k = 0; j >= s1; j--, k++) {
					k1[k + 1] = (str1[j] == str0[i]) ? k0[k] + 1 : Math.max(k1[k], k0[k + 1]);
				}
			}
			copyArr(k1, LT);
		}
		function diff(s0, e0, s1, e1) {
			var k;
			if (e0 == s0) {
				for (k = s1; k <= e1; k++) {
					if (str1[k] == str0[s0]) break;
				}
				if (k <= e1) {
					var l = str1.slice(s1, k), r = str1.slice(k + 1, e1 + 1);
					return ((l == "" ? "" : "<ins>" + util.Escape(l) + "</ins>") + 
						(s0 < str0.length ? util.Escape(str0[s0]) : "") + 
						(r == "" ? "" : "<ins>" + util.Escape(r) + "</ins>"));
				} else {
					return ((s0 < str0.length ? ("<del>" + util.Escape(str0[s0]) + "</del>") : "") + 
						((s1 < (e1+1)) ? ("<ins>" + util.Escape(str1.slice(s1, e1+1)) + "</ins>") : ""));
				}
			} else if (s1 == e1) {
				for (k = s0; k <= e0; k++) {
					if (str0[k] == str1[s1]) break;
				}
				if (k <= e0) {
					var l = str0.slice(s0, k), r = str0.slice(k + 1, e0 + 1);
					return ((l == "" ? "" : "<del>" + util.Escape(l) + "</del>") + 
						(s1 < str1.length ? util.Escape(str1[s1]) : "") + 
						(r == "" ? "" : "<del>" + util.Escape(r) + "</del>"));
				} else {
					return (((s0 < (e0+1)) ? ("<del>" + util.Escape(str0.slice(s0, e0+1)) + "</del>") : "") +
						(s1 < str1.length ? ("<ins>" + util.Escape(str1[s1]) + "</ins>") : ""));
				}
			}
			var mid = Math.floor((s0 + e0) / 2);
			forwards(s0, mid, s1, e1);
			backwards(mid + 1, e0, s1, e1);
			var L = 0;
			var minK = s1;
			for (k = 1, len = e1 - s1 + 1; k <= len; k++) {
				if (L < (LE[k] + LT[len - k])) {
					L = (LE[k] + LT[len - k]);
					minK = k + s1 - 1;
				}
			}
			return diff(s0, mid, s1, minK) + diff(mid + 1, e0, minK + 1, e1); 
		}
		return diff(0, m-1, 0, n-1);
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
	util.Escape = function(str) {
		return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	}
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
