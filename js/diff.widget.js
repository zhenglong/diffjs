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
		_makeMismatch: function(lineno, line, data, tableElement) {
			this._makeLine("mismatch line-content", line, data, tableElement, lineno);
		},
		_makeMatch: function(lineno, line, data, tableElement) {
			this._makeLine("match line-content", line, data, tableElement, lineno);
		},
		_makeLine: function(classes, line, data, tableElement, lineno) {
			$("<tr></tr>").append($("<td></td").text(lineno || "").addClass("lineno"))
													.append($("<td></td").text(line).addClass(classes))
													.data("index", data)
													.appendTo(tableElement);
		},
		_initVariables: function() {
			this._curNo = -1;
			this._diffs = [];
			this._tableWrapper = null;
			this.leftData = null;
			this.rightData = null;
		},
		refresh: (function(data) {
			this.element.html("");
			this._initVariables();
			this.leftData = data.files[0].lines;
			this.rightData = data.files[1].lines;
			var prev, next = 1,
						lines0 = data.files[0].lines,
						lines1 = data.files[1].lines;
						tableLeft = $("<table></table>").addClass("file-content"),
						tableRight = $("<table></table>").addClass("file-content"),
						i = j = realI = realJ = backup = 1;
			this._makeHead(data.files[0].name || "", tableLeft);
			this._makeHead(data.files[1].name || "", tableRight);
			var self = this;
			data.commonLines.push({a:lines0.length+1, b:lines1.length+1});
			$.each(data.commonLines, function(index, common) {
				backup = realI;
				while ((i <= lines0.length && i < common.a) && 
					(j <= lines1.length && j < common.b)) { 
					self._makeMismatch(i, lines0[i - 1], j-1, tableLeft); realI++;
					self._makeMismatch(j, lines1[(j++) - 1], (i++)-1, tableRight); realJ++;
				}
				while (i <= lines0.length && i < common.a) {
					self._makeMismatch(i, lines0[i - 1], null, tableLeft); realI++;
					self._makeMismatch("", "", (i++) - 1, tableRight); realJ++;
				}
				while (j <= lines1.length && j < common.b) {
					self._makeMismatch("", "", j - 1, tableLeft); realI++;
					self._makeMismatch(j, lines1[(j++) - 1], null, tableRight); realJ++;
				}
				if (realI != realJ) throw "invalid operation";
				if (backup != realI) self._diffs.push({start: backup - 1, end: realI - 1});
				if (i <= lines0.length) self._makeMatch(i, lines0[(i++)-1], realI, tableLeft);
				if (j <= lines1.length) self._makeMatch(j, lines1[(j++)-1], realJ, tableRight);
				realI++;
				realJ++;
			});

			var wrapper = $("<div></div>").addClass("comparison-result");
			$("<div></div>").addClass("file-content-wrapper left")
				.append(tableLeft).appendTo(wrapper);
			$("<div id='tool'></div>").appendTo(wrapper);
			$("<div></div>").addClass("file-content-wrapper right")
				.append(tableRight).appendTo(wrapper);
			this.element.append($("<div id='mismatch-indicator'></div>"));
			$("<div id='comparison-wrapper'></div>").append(wrapper).appendTo(this.element);
			
			var intervalId = setInterval(function () {
				var total = realI - 2;
				var width = $("#mismatch-indicator").width();
				var height = $("#comparison-wrapper").height();
				if (height <= 0) return;
				clearInterval(intervalId);
				intervalId = 0;
				var r = Raphael("mismatch-indicator", width, height);
				var h, nextX = 0, prevEnd = 0, glowWidth = 3, glow = null;
				$.each(self._diffs, function(i, _diff) {
					// the mismatched lines between (start, end]
					h = ((_diff.end - _diff.start) / total) * height;
					nextX = nextX + ((_diff.start - prevEnd) / total) * height;
					r.rect(glowWidth, nextX, width - (2 * glowWidth), h).attr({ "fill":"red", "stroke-width":"0" })
						.data("i", i)
						.hover(function() {
							glow = this.glow({"color":"#A2192D", "width":glowWidth});
						}, function() {
							glow.forEach(function(el) { el.remove(); });
							glow.clear();
							glow = null;
						})
						.click(function() {
							self._curNo = this.data("i");
							self.tableWrapper.scrollTop($(".file-content:eq(0)", self.tableWrapper)
								.find("tr:eq(" + (self._diffs[self._curNo].start) + ")").position().top);
						});
					nextX = nextX + h;
					prevEnd = _diff.end;
				});
			}, 30);
			if (this._diffs.length > 0) {
				this._curNo = 0;
				this.tableWrapper = $("#comparison-wrapper");
				$("tr", tableLeft).slice(this._diffs[this._curNo].start, this._diffs[this._curNo].end)
					.find("td:not(.lineno)").addClass("mismatch-highlight");
				$("tr", tableRight).slice(this._diffs[this._curNo].start, this._diffs[this._curNo].end)
					.find("td:not(.lineno)").addClass("mismatch-highlight");
				this.tableWrapper.scrollTop($(tableLeft.find("tr")[this._diffs[this._curNo].start + 1]).position().top-20);
			}
		}),
		_bindEvents: function() {
			this.element.on("keypress", $.proxy(this._onKeyPress, this));
			var self = this;
			this.element.on("click", ".line-content", function(event) {
				$("#comparison-wrapper").focus();
				event.stopPropagation();
			}).on("click", ".line-content.mismatch", $.proxy(this._onMismatchedRowClick, this))
			.on("dblclick", ".line-content.mismatch", $.proxy(this._onMismatchedRowDblClick, this));
		},
		_onKeyPress: function(e) {
			switch(e.which) {
				case 78: // next difference
				if (this._curNo < (this._diffs.length - 1)) {
					var self = this;
					var tables = $(".file-content", this.tableWrapper);
					tables.each(function(index) {
						$("tr", $(this)).slice(self._diffs[self._curNo].start, self._diffs[self._curNo].end)
							.find("td:not(.lineno)").removeClass("mismatch-highlight");
					});
					this._curNo++;
					tables.each(function(index) {
						$("tr", $(this)).slice(self._diffs[self._curNo].start, self._diffs[self._curNo].end)
							.find("td:not(.lineno)").addClass("mismatch-highlight");
					});
					this.tableWrapper.scrollTop($(".file-content:eq(0)", this.tableWrapper)
					.find("tr:eq(" + (this._diffs[this._curNo].start) + ")").position().top);
				}
				break;
				case 80: // previous difference
				if (this._curNo > 0) {
					var self = this;
					var tables = $(".file-content", this.tableWrapper);
					tables.each(function(index) {
						$("tr", this).slice(self._diffs[self._curNo].start, self._diffs[self._curNo].end)
							.find("td:not(.lineno)").removeClass("mismatch-highlight");
					});
					this._curNo--;
					tables.each(function(index) {
						$("tr", this).slice(self._diffs[self._curNo].start, self._diffs[self._curNo].end)
							.find("td:not(.lineno)").addClass("mismatch-highlight");
					});
					this.tableWrapper.scrollTop($(".file-content:eq(0)", this.tableWrapper)
					.find("tr:eq(" + (this._diffs[this._curNo].start) + ")").position().top);
				}
				break;
				case 40: // next line
				break;
				case 38: // previous line
				break;
			}
		},
		_notify: null,
		_getText: function(index, whichTable) {
			if (index == null || index == undefined) {
				return "";
			}
			if (whichTable.is(".left")) return this.rightData[index];
			if (whichTable.is(".right")) return this.leftData[index];
		},
		_onMismatchedRowClick: function(e) {
				var $this = $(e.currentTarget);
				var $parent = $this.parent();
				var text1 = this._getText($parent.data("index"), $parent.parent().parent().parent());
				var result = window.util.DiffString(text1, $this.text());
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
