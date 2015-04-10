var mediaWidth = $('#vpWidth');
$(window).load(function(){
  mediaWidth.text($(this).width());
});
$(window).resize(function(){
  mediaWidth.text($(this).width());
});