(function(window, $) {
	var util = window.util = (window.util || {});
	if ($ == null) {
		$ = {};
		$.each = function(obj, callback) {
			for (var index = 0; index < obj.length; index++) {
				callback(index, obj[index]);
			}
		}
		$.shadowCopy = function(src) {
			var result = {};
			for(var p in src) {
				result[p] = src[p];
			}
			return result;
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
						var prev = K[mid].a != (i + 1) ? $.shadowCopy(K[mid]) : c.previous;
						K[r] = c;
						r = mid + 1;
						c = { a: i+1, b: j, previous: prev };
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
			if (k > 0) {
				outputCandidates.splice(0, 0, K[k]);
				var temp =K[k].previous; 
				while(temp != null && temp.a > 0 && temp.a <= lines0.length && 
					temp.b > 0 && temp.b <= lines1.length && 
					lines0[temp.a - 1] == lines1[temp.b - 1]) {
					outputCandidates.splice(0,0, temp);
					temp = temp.previous;
				}
				$.each(outputCandidates, function(i, candidate) {
					if (candidate.a > 0 && candidate.a <= lines0.length && 
						candidate.b > 0 && candidate.b <= lines1.length && 
						lines0[candidate.a - 1] == lines1[candidate.b - 1]) output.push(lines0[candidate.a - 1]);
				});
			}
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
			args = Array.prototype.slice.call(arguments, 1);
		}
		for(var key in args) {
			formatter = formatter.replace(new RegExp("\\{" + key + "\\}", "g"), args[key]);
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

/*
 * color value conversion among HSL, RGB and HSV
 * from http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
 */
(function(window) {
	
	/**
	 * Converts an RGB color value to HSL. Conversion formula
	 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
	 * Assumes r, g, and b are contained in the set [0, 255] and
	 * returns h, s, and l in the set [0, 1].
	 *
	 * @param   Number  r       The red color value
	 * @param   Number  g       The green color value
	 * @param   Number  b       The blue color value
	 * @return  Array           The HSL representation
	 */
	function rgbToHsl(r, g, b) {
		r /= 255, g /= 255, b /= 255;
		var max = Math.max(r, g, b), min = Math.min(r, g, b);
		var h, s, l = (max + min) / 2;

		if (max == min) {
			h = s = 0;
			// achromatic
		} else {
			var d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch(max) {
				case r:
					h = (g - b) / d + (g < b ? 6 : 0);
					break;
				case g:
					h = (b - r) / d + 2;
					break;
				case b:
					h = (r - g) / d + 4;
					break;
			}
			h /= 6;
		}

		return [h, s, l];
	}

	/**
	 * Converts an HSL color value to RGB. Conversion formula
	 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
	 * Assumes h, s, and l are contained in the set [0, 1] and
	 * returns r, g, and b in the set [0, 255].
	 *
	 * @param   Number  h       The hue
	 * @param   Number  s       The saturation
	 * @param   Number  l       The lightness
	 * @return  Array           The RGB representation
	 */
	function hslToRgb(h, s, l) {
		var r, g, b;

		if (s == 0) {
			r = g = b = l;
			// achromatic
		} else {
			function hue2rgb(p, q, t) {
				if (t < 0)
					t += 1;
				if (t > 1)
					t -= 1;
				if (t < 1 / 6)
					return p + (q - p) * 6 * t;
				if (t < 1 / 2)
					return q;
				if (t < 2 / 3)
					return p + (q - p) * (2 / 3 - t) * 6;
				return p;
			}

			var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			var p = 2 * l - q;
			r = hue2rgb(p, q, h + 1 / 3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1 / 3);
		}

		return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	}

	/**
	 * Converts an RGB color value to HSV. Conversion formula
	 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
	 * Assumes r, g, and b are contained in the set [0, 255] and
	 * returns h, s, and v in the set [0, 1].
	 *
	 * @param   Number  r       The red color value
	 * @param   Number  g       The green color value
	 * @param   Number  b       The blue color value
	 * @return  Array           The HSV representation
	 */
	function rgbToHsv(r, g, b) {
		r = r / 255, g = g / 255, b = b / 255;
		var max = Math.max(r, g, b), min = Math.min(r, g, b);
		var h, s, v = max;

		var d = max - min;
		s = max == 0 ? 0 : d / max;

		if (max == min) {
			h = 0;
			// achromatic
		} else {
			switch(max) {
				case r:
					h = (g - b) / d + (g < b ? 6 : 0);
					break;
				case g:
					h = (b - r) / d + 2;
					break;
				case b:
					h = (r - g) / d + 4;
					break;
			}
			h /= 6;
		}

		return [h, s, v];
	}

	/**
	 * Converts an HSV color value to RGB. Conversion formula
	 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
	 * Assumes h, s, and v are contained in the set [0, 1] and
	 * returns r, g, and b in the set [0, 255].
	 *
	 * @param   Number  h       The hue
	 * @param   Number  s       The saturation
	 * @param   Number  v       The value
	 * @return  Array           The RGB representation
	 */
	function hsvToRgb(h, s, v) {
		var r, g, b;

		var i = Math.floor(h * 6);
		var f = h * 6 - i;
		var p = v * (1 - s);
		var q = v * (1 - f * s);
		var t = v * (1 - (1 - f) * s);

		switch(i % 6) {
			case 0:
				r = v, g = t, b = p;
				break;
			case 1:
				r = q, g = v, b = p;
				break;
			case 2:
				r = p, g = v, b = t;
				break;
			case 3:
				r = p, g = q, b = v;
				break;
			case 4:
				r = t, g = p, b = v;
				break;
			case 5:
				r = v, g = p, b = q;
				break;
		}

		return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	}
	
	function decimalToHex(i, padding) {
		var hex = Number(i).toString(16);
		padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

		while (hex.length < padding) {
			hex = "0" + hex;
		}

		return hex;
	}

	function rgbVectorToWebColor(vector) {
		return "#" + decimalToHex(vector[0]) + decimalToHex(vector[1]) + decimalToHex(vector[2]);
	}
	

	var util = window.util = (window.util || {});
	util.rgbToHsl = rgbToHsl;
	util.hslToRgb = hslToRgb;
	util.rgbToHsv = rgbToHsv;
	util.hsvToRgb = hsvToRgb;
	util.rgbVectorToWebColor = rgbVectorToWebColor;
})(window);
