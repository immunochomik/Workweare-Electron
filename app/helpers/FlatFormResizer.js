
var FlatFormResizer = (function() {
  function FlatFormResizer(settings) {
    this.mainInputId = settings.mainInputId;
    this.itemsSizes = settings.itemsSizes;
    this.afterResize = settings.afterResize;
    this.parentDivId = settings.parentDivId || 'mainDiv';
    this.mainInputOffset = settings.mainInputOffset;
  }
  FlatFormResizer.prototype.resize = function() {
    if (document.getElementById(this.mainInputId)) {
      this.itemsSizes[this.mainInputId] = (
        document.getElementById(this.parentDivId).offsetWidth - this.mainInputOffset) + 'px';
      if (window.innerWidth < 528) {
        for (var id in this.itemsSizes) {
          try {
            document.getElementById(id).style.width = '100%';
            document.getElementById(id).style.dispaly = 'block';
          } catch (err) {
            console.log(id, err.message);
          }
        }
      } else {
        for (var id in this.itemsSizes) {
          try {
            document.getElementById(id).style.width = this.itemsSizes[id];
          } catch (err) {
            console.log(id, err.message);
          }
        }
      }
      if(this.afterResize) {
        this.afterResize();
      }
    }
  };
  return FlatFormResizer;
})();


export default {
  FlatFormResizer
}