(function() {

  function e(e, t) {
    var l = document.querySelector(".feature-nav"),
        r = l.querySelector('li[data-target="' + e.element.id + '"]');
    var c = l.querySelector("li.active");
    c && c.classList.toggle("active"), r.classList.toggle("active");
  }

  var t = 777, l = 80;

  zenscroll.setup(t, l);

  for (var r = document.querySelector(".faq-list"), c = r.querySelectorAll(".item"), o = 0; o < c.length; o++) {
    var a = c[o];
    a.addEventListener("click", function() {
      this.classList.toggle("active");
      for (var e = document.querySelector(".faq-list"), t = e.querySelectorAll(".item"), l = 0; l < t.length; l++) {
        var r = t[l];
        r != this && r.classList.remove("active");
      }
    });
  }

  for (var i = document.querySelectorAll(".section"), o = 0; o < i.length; o++) {
    var n = i[o];
    new Waypoint({ element: n, offset: 81, handler: function(t) { e(this, t) } });
  }

})();
