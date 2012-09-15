(function($, window) {
	$.widget("widget.diff", {
		options: {
			diffTag: "diff"
		},
		
		_init: function() {
		},
		_makeHead: function(name, tableElement) {
			$("<td/>").text(name).attr("colspan", "2").addClass("file-name")
				.appendTo($("<tr/>")).appendTo(tableElement);
		},
		_makeMismatch: function(lineno, line, tableElement) {
			this._makeLine("mismatch line-content", line, tableElement, lineno);
		},
		_makeMatch: function(lineno, line, tableElement) {
			this._makeLine("match line-content", line, tableElement, lineno);
		},
		_makeLine: function(classes, line, tableElement, lineno) {
			$("<tr></tr>").append($("<td></td").text(lineno || "").addClass("lineno"))
													.append($("<td></td").text(line).addClass(classes))
													.appendTo(tableElement);
		},
		refresh: (function(data) {
			this.element.html("");
			var lines0 = data.files[0].lines;
			var lines1 = data.files[1].lines;
			var tableLeft = $("<table></table>").addClass("file-content"),
			tableRight = $("<table></table>").addClass("file-content"),
			i = 1, j = 1, leftFillings = 0, rightFillings = 0;
			this._makeHead(data.files[0].name || "", tableLeft);
			this._makeHead(data.files[1].name || "", tableRight);
			var self = this;
			$.each(data.commonLines, function(index, common) {
				if ((common.a < 1 && common.a > lines0.length) || 
					(common.b < 1 && common.b > lines1.length)) return;
				while (i < common.a) self._makeMismatch(i, lines0[(i++) - 1], tableLeft);
				while (j < common.b) self._makeMismatch(j, lines1[(j++) - 1], tableRight);

				var newI = (i + leftFillings), newJ = j + rightFillings;
				if (newI != newJ) {
					var m = Math.min(newI, newJ) + 1, n = Math.max(newI, newJ), table, lines;
					if (newI < newJ) {
						table = tableLeft;
						lines = lines0;
						leftFillings = leftFillings + n - m + 1;
					} else {
						table = tableRight;
						lines = lines1;
						rightFillings = rightFillings + n - m + 1;
					}
					while (m <= n) { self._makeMismatch("", "", table); m++; }
				}
				self._makeMatch(i, lines0[(i++) - 1], tableLeft);
				self._makeMatch(j, lines1[(j++) - 1], tableRight);
			});
			while (i <= lines0.length) this._makeMismatch(i, lines0[(i++) - 1], tableLeft);
			while (j <= lines1.length) this._makeMismatch(j, lines0[(j++) - 1], tableRight);

			$("<div></div>").addClass("file-content-wrapper left")
				.append(tableLeft).appendTo(this.element);
			$("<div id='tool'></div>").appendTo(this.element);
			$("<div></div>").addClass("file-content-wrapper right")
				.append(tableRight).appendTo(this.element);
		}),
		_bindEvents: function() {
			
		},
		_onKeyDown: function() {
			
		}
	});
})(jQuery, window);
