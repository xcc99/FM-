var EventCenter = {
  on: function(type, handler){
    $(document).on(type, handler)
  },
  fire: function(type, detail){
    $(document).trigger(type, detail)
  }
}

var Footer = {
	init: function(){//初始化
		this.$footer = $('footer')
		this.getData()
		// this.randomSort()
	},
	bind: function(){//绑定事件
		var _this = this
		var $left = this.$footer.find('.icon-left')
		var $right = this.$footer.find('.icon-right')
		var $boxWidth = parseFloat(this.$footer.find('.box').width())
		var $liWidth = parseFloat(this.$footer.find('li').outerWidth(true))
		var $ul = this.$footer.find('ul')
		var $li = this.$footer.find('li')
		var isEnd = false //滚动一开始不是在结尾
		var isStart = true  //一开始是在首页
		var isAnimate = false //动画是否进行时
		//下一页
		$right.on('click',function(){
			if(isAnimate) return //如果动画在进行，直接return
			if(!isEnd){ //如果不是尾页
				
				$ul.animate({
					'left': '-=' + Math.floor($boxWidth / $liWidth) * $liWidth
				},500,function() {
					isAnimate = false  //动画完成后
					isStart = false
					if($boxWidth - $ul.position().left >= $ul.width()){
						isEnd =true
					}
				})
				isAnimate = true 
			}
		})
		//上一页
		$left.on('click',function(){
			if(isAnimate) return
			if(!isStart){
				$ul.animate({
					'left': '+=' + Math.floor($boxWidth / $liWidth) * $liWidth
				},500,function() {
					isAnimate = false
					isEnd = false
					if($ul.position().left >= 0){
						isStart =true
					}
				})
				isAnimate = true
			}
		})
		//给li绑定事件
		this.$footer.on('click','li',function(){
			$(this).addClass('active').siblings().removeClass('active')
			EventCenter.fire('selected',{
				channelId: $(this).attr('channel-id'),
				channelName: $(this).attr('channel-name')
			})	
		})
		// console.log($(this).attr('channel-id')) //找不到
	},
	render: function(data){//页面渲染
		// console.log(data)
		var _this = this
		var $ul = this.$footer.find('ul')
		data.forEach(function(val){
			var tpl = '<li channel-id =  ' + val.channel_id + ' channel-name='+ val.name+'><div class = "pic" style="background-image: url(' 
					+ val.cover_small + ' "></div><h3>' 
					+ val.name + '</h3></li>'
			var $tpl = $(tpl)
			$ul.append($(tpl))
		})
		this.style()
	},
	getData: function(){//获取数据
		var _this = this
		$.getJSON('http://api.jirengu.com/fm/getChannels.php').done(function(ret){
			// console.log(ret)
			var data = ret.channels
			_this.render(data)
			// _this.randomSort(data)
		}).fail(function(){
			console.log('erro...')
		})
	},
	style: function(){
		var $li = this.$footer.find('li')
		var width = $li.outerWidth(true)
		var count = $li.length
		// console.log(width,count)
		this.$footer.find('ul').css({
			width: width * count +'px'	
		})
		this.bind()
		
	}
	// randomSort(data){
	// 	var _this = this
	// 	if(data){
	// 		console.log(data)
	// 		var num = Math.floor(Math.random() * data.length)
	// 		var randomName = data[num]
	// 		var randomId = randomName.channel_id
	// 		// console.log(randomName,randomId)
	// 		_this.Event()
	// 	}	
	// }
}
var Fm = {
	init(){//初始化
		this.$section = $('section').eq(0)
		this.audio = new Audio()
		this.audio.autoplay = true
		this.bind()

	},
	bind(){//绑定事件
		var _this = this
		EventCenter.on('selected',function(e,channels){
			_this.channelId = channels.channelId
			_this.channelName = channels.channelName
			console.log(_this.channelId,_this.channelName)
			_this.loadMusic()
			
		})
		//播放暂停
		_this.$section.find('.msg .tabs').on('click',function(){
			if($(this).hasClass('icon-pause')){
				_this.audio.pause()
				$(this).addClass('icon-play').removeClass('icon-pause')
			}else{
				_this.audio.play()
				$(this).addClass('icon-pause').removeClass('icon-play')
			}
		})
		//下一首
		_this.$section.find('.msg .icon-next').on('click',function(){
			_this.loadMusic()
		})
		// 进度条
		this.audio.addEventListener('play',function(){
			// console.log('play')
			clearInterval(_this.time)
			_this.time = setInterval(function(){
				_this.setStatus()
			},1000)
		})

		this.$bar = this.$section.find('.probar')
		this.$bar.on('click',function(e){
			
				//每次点击都能获取到当前距离起点的长度
			// console.log(e.offsetX)
			// console.log(parseInt(getComputedStyle(this).width))
			var currentWidth = e.offsetX / parseInt(getComputedStyle(this).width)
			// console.log(currentWidth)
			_this.audio.currentTime = currentWidth * _this.audio.duration
			
			
			
		})
		this.audio.addEventListener('pause',function(){
			// console.log('pasue')
			clearInterval(_this.time)
		})
		this.audio.onended=function(){
			_this.loadMusic()
		}
		
	},
	rander(){//渲染页面
		// console.log(this.song)
		var _this = this
		this.$bg = this.$section.find('.bg')
		this.$pic = this.$section.find('figure')
		this.$title = this.$section.find('.player .title')
		this.$singer = this.$section.find('.player .singer')
		this.$label = this.$section.find('.player .label')

		this.$bg.css('background-image','url('+this.song.picture+')')
		this.$pic.css('background-image','url('+this.song.picture+')')
		this.$title.text(this.song.title)
		this.$singer.text(this.song.artist)
		this.$label.text(this.channelName)
		// console.log(this.channelName)
	},
	loadMusic(){
		var _this = this
		$.getJSON('http://api.jirengu.com/fm/getSong.php',{
			channel: this.channelId,
			name: this.channelName
		}).done(function(ret){
			console.log(ret)
			_this.song = ret.song[0]
			_this.rander()
			console.log(name)
			console.log(ret.song[0])
			_this.playMusic()
			_this.$section.find('.tabs').addClass('icon-pause').removeClass('icon-play')
			_this.$section.find('.newbar').css('width',0+ 'px')
			_this.getLyric()
		})

	},
	playMusic(){
		this.audio.src = this.song.url
	},
	setStatus(){
		// console.log('当前时间'+ _this.audio.currentTime)
		var min = Math.floor(this.audio.currentTime / 60)
		var sec = Math.floor(this.audio.currentTime % 60)
		// console.log(min)
		var clock = min +':' + (sec > 9 ? sec : '0' +sec)
		//时间
		this.$section.find('.bar .time').text(clock)
		//进度条
		this.$section.find('.bar .newbar').animate({width: this.audio.currentTime / this.audio.duration * 100 +'%'})

		//歌词
		
		console.log('0'+clock)
		var line = this.lyricObj['0'+ clock]
		// console.log(line)
		if(line){
			 _this.$section.find('.player .lyrics').text(line).boomText('lightSpeedIn')
			// _this.$section.find('.player .lyrics').addClass('animated ' + type)
		}
	},
	getLyric(){
		_this = this
		// console.log(_this.song.sid)
		$.getJSON('https://jirenguapi.applinzi.com/fm/getLyric.php',{
			sid: _this.song.sid
		}).done(function(ret){
			var arr = ret.lyric.split('\n')//把歌词变成一个数组
			console.log(arr[0])
			var lyricObj = {}
			arr.forEach(function(val){//遍历数组里面的每一项
				//var times = val.match(/\[\d{2}:\d{2}.\d{2}\]/g)//匹配出前面的时间
				//val.match(/\[.*\]/g)
				//var lyric = val.replace(/\[\d{2}:\d{2}\.\d{2}\]/g,'')//把一行上的时间替换成空得到歌词
				var times = val.match(/\d{2}:\d{2}/g)
				var lyric = val.replace(/\[.+?\]/g,'')
				// console.log(times,lyric)
				if(Array.isArray(times)){//如果time是一个数组，有时候time可能是null
					times.forEach(function(time){//遍历时间
						lyricObj[time] = lyric
					})
				}
				
			})
			_this.lyricObj = lyricObj
			console.log(_this.lyricObj)
		}).fail(function(){
			console.log('erro...')
			_this.$section.find('.player .lyrics').text('暂时没有歌词...')
		})
	}
} 

//插件
$.fn.boomText = function(type){
	var type = type || 'rollIn'
	this.html(function(){
		var words = $(this).text().split('')
		.map(function(e){
			return '<span class="boomText">' + e +'</span>'
		})
		return words.join('')
	})
	var index = 0
	var $text = $(this).find('span')
	var clock = setInterval(function(){
		$text.eq(index).addClass('animated ' + type)
		index++
		if(index >= $text.length){
			clearInterval(clock)
		}
	},30)	
}
Footer.init()
Fm.init()

/*播放完播放下一首
进去之后自动播放
拖动进度条
收藏
*/