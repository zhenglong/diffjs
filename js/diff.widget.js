(function($, window) {
	$.widget("widget.diff", {
		options: {
			diffTag: "diff"
		},
		_curNo: -1,
		_diffs: [],
		_init: function() {
			this.element.attr("tabindex", "0");
			this._bindEvents();
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
		_initVariables: function() {
			this._curNo = -1;
			this._diffs = [];
		},
		refresh: (function(data) {
			this.element.html("");
			this._initVariables();
			var prev, next = 1,
						lines0 = data.files[0].lines,
						lines1 = data.files[1].lines;
						tableLeft = $("<table></table>").addClass("file-content"),
						tableRight = $("<table></table>").addClass("file-content"),
						i = 1, j = 1, leftFillings = 0, rightFillings = 0;
			this._makeHead(data.files[0].name || "", tableLeft);
			this._makeHead(data.files[1].name || "", tableRight);
			var self = this;
			$.each(data.commonLines, function(index, common) {
				if ((common.a < 1 && common.a > lines0.length) || 
					(common.b < 1 && common.b > lines1.length)) return;
				var mismatched = (i < common.a) || (j < common.b);
				mismatched && (prev = next);
				while (i < common.a) self._makeMismatch(i, lines0[(i++) - 1], tableLeft);
				while (j < common.b) self._makeMismatch(j, lines1[(j++) - 1], tableRight);

				var newI = (i + leftFillings), newJ = j + rightFillings;
				if (mismatched) {next = Math.max(newI, newJ); self._diffs.push({start:prev-1, end:next-1}); }
				if (newI != newJ) {
					var m = Math.min(newI, newJ) + 1, n = next, table, lines;
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
				next++;
			});
			while (i <= lines0.length) this._makeMismatch(i, lines0[(i++) - 1], tableLeft);
			while (j <= lines1.length) this._makeMismatch(j, lines0[(j++) - 1], tableRight);

			i = 0;
			tableLeft.find("tr").each(function() {
				$(this).data("index", ++i);
			});
			i = 0;
			tableRight.find("tr").each(function() {
				$(this).data("index", ++i);
			})

			var wrapper = $("<div></div>").addClass("comparison-result");
			$("<div></div>").addClass("file-content-wrapper left")
				.append(tableLeft).appendTo(wrapper);
			$("<div id='tool'></div>").appendTo(wrapper);
			$("<div></div>").addClass("file-content-wrapper right")
				.append(tableRight).appendTo(wrapper);
			wrapper.appendTo(this.element);
			if (this._diffs.length > 0) {
				this._curNo = 0;
				$("tr", tableLeft).slice(this._diffs[this._curNo].start, this._diffs[this._curNo].end)
					.find("td:not(.lineno)").addClass("mismatch-highlight");
				$("tr", tableRight).slice(this._diffs[this._curNo].start, this._diffs[this._curNo].end)
					.find("td:not(.lineno)").addClass("mismatch-highlight");
				this.element.scrollTop($($("tr", tableLeft)
					.find("tr")[this._diffs[this._curNo].start + 1]).position().top-20);
			}
		}),
		_bindEvents: function() {
			this.element.on("keypress", $.proxy(this._onKeyPress, this));
			var self = this;
			this.element.on("click", ".line-content", function() {
				self.element.focus();
			}).on("click", ".line-content.mismatch", $.proxy(this._onMismatchedRowClick, this))
			.on("dblclick", ".line-content.mismatch", $.proxy(this._onMismatchedRowDblClick, this));
		},
		_onKeyPress: function(e) {
			switch(e.which) {
				case 78: // next difference
				if (this._curNo < (this._diffs.length - 1)) {
					var self = this;
					$(".file-content", this.elment).each(function(index) {
						$("tr", $(this)).slice(self._diffs[self._curNo].start, self._diffs[self._curNo].end)
							.find("td:not(.lineno)").removeClass("mismatch-highlight");
					});
					this._curNo++;
					$(".file-content", this.elment).each(function(index) {
						$("tr", $(this)).slice(self._diffs[self._curNo].start, self._diffs[self._curNo].end)
							.find("td:not(.lineno)").addClass("mismatch-highlight");
					});
					this.element.scrollTop($($($(".file-content", this.element)[0])
					.find("tr")[this._diffs[this._curNo].start + 1]).position().top-20);
				}
				break;
				case 80: // previous difference
				if (this._curNo > 0) {
					var self = this;
					$(".file-content", this.elment).each(function(index) {
						$("tr", $(this)).slice(self._diffs[self._curNo].start, self._diffs[self._curNo].end)
							.find("td:not(.lineno)").removeClass("mismatch-highlight");
					});
					this._curNo--;
					$(".file-content", this.elment).each(function(index) {
						$("tr", $(this)).slice(self._diffs[self._curNo].start, self._diffs[self._curNo].end)
							.find("td:not(.lineno)").addClass("mismatch-highlight");
					});
					this.element.scrollTop($($($(".file-content", this.element)[0])
					.find("tr")[this._diffs[this._curNo].start + 1]).position().top-20);
				}
				break;
				case 40: // next line
				break;
				case 38: // previous line
				break;
			}
		},
		_notify: null,
		_onMismatchedRowClick: function(e) {
				var $this = $(e.currentTarget);
				var index = $this.parent("tr").data("index");
				var texts = [];
				$("tr:nth-child(" + index + ")", $(this.element))
					.children("td:not(.lineno)")
					.each(function() { texts.push($(this).text()); });
				var result = window.util.DiffString(texts[0], texts[1]);
			if (this._notify == null) {
				this._notify = $.pnotify({ title:"detail:<hr/>", text: result, sticker:false,
				history:false, icon:false, type:"info", stack:false,animate_speed:"fast",
				hide:false, addclass: "ui-pnotify-container-custom" });
			}
			this._notify.pnotify({ text: result });
		},
		_onMismatchedRowDblClick: function(e) {
			
		}
	});
})(jQuery, window);
