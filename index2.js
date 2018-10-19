var Footer = {
	init(){
		var $footer = $('footer')
		this.getData()
		
	},
	bind(){

	},
	render(data){
		var _this = this
		var $ul = _this.$footer.find('ul')
		data.forEach(function(val){
			var tpl = '<li><div class="pic" style="background-image: url('+ val.cover_small+')"></div><h3>'+ val.name +'</h3></li>'
			var $tpl=$(ptl) //把格式转换成jQuery
		})
		

		return $ul.append($tpl)
	},
	getData(){
		var _this = this
		$.getJSON('http://api.jirengu.com/fm/getChannels.php')
		.done(function(res){
			var data = res.channels
			console.log(data)
			_this.render(data)
		})
	}
}
Footer.init()