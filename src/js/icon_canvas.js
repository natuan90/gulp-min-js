/********  CANVAS  ********/

//■CANVAS　びっくりマーク canvas script
function aleartCanvas(){

	//基本定義
	item_Target = document.querySelector(".aleartCanvas"),
	ctx = item_Target.getContext("2d"),//canvas対象定義
	colorIcon = "#FFF",//びっくりマークの色
	colorBk = "#F30";//三角形の背景色
	ctx.clearRect(0, 0, 110, 110);

	// 三角形
	ctx.beginPath();
	ctx.fillStyle = colorBk;
	ctx.moveTo(10, 98);
	ctx.bezierCurveTo(16,98, 100,98, 102,98);
	ctx.bezierCurveTo(106,98, 110,94, 108,90);
	ctx.bezierCurveTo(106,86, 64,16, 62,10);
	ctx.bezierCurveTo(60,6, 54,6, 52,10);
	ctx.bezierCurveTo(48,14, 8,84, 6,90);
	ctx.bezierCurveTo(4,92, 6,98, 10,98);
	ctx.fill();

	// びっくりマーク　丸
	ctx.save();
	ctx.beginPath();
	ctx.transform(0.16, 0, 0, 0.16, 50, 18);
	ctx.fillStyle = colorIcon;
	ctx.arc(40, 400, 40, 0, Math.PI*2, false);
	ctx.fill();
	ctx.restore();

	// びっくりマーク　棒
	ctx.beginPath();
	ctx.fillStyle = colorIcon;
	ctx.moveTo(62, 32);
	ctx.bezierCurveTo(62, 30, 60, 28, 56, 28);
	ctx.lineTo(56, 28);
	ctx.bezierCurveTo(56, 28, 56, 28, 56, 28);
	ctx.bezierCurveTo(56, 28, 56, 28, 56, 28);
	ctx.lineTo(56, 28);
	ctx.bezierCurveTo(54, 28, 52, 30, 52, 32);
	ctx.bezierCurveTo(52, 32, 52, 46, 52, 50);
	ctx.bezierCurveTo(52, 58, 54, 64, 54, 66);
	ctx.bezierCurveTo(54, 68, 56, 70, 56, 64);
	ctx.lineTo(56, 68);
	ctx.bezierCurveTo(56, 68, 56, 68, 56, 68);
	ctx.bezierCurveTo(56, 68, 56, 68, 56, 68);
	ctx.lineTo(56, 68);
	ctx.bezierCurveTo(58, 68, 60, 68, 60, 66);
	ctx.bezierCurveTo(60, 64, 62, 58, 62, 50);
	ctx.bezierCurveTo(62, 46, 62, 32, 62, 32);
	ctx.fill();
}

//■TEL用 canvas script
//		<div class="tel_icon_box">
//			<canvas class='tel_icon' width='100' height='100'></canvas>
//		</div>

$(function(){
	telIcon();
});
function telIcon() {
	var i=0;
	$(".tel_icon").each(function(){
		$(this).addClass("tel_icon"+i);
		var class_name = ".tel_icon"+i,
			item_Target = document.querySelector(class_name),
			ctx = item_Target.getContext("2d");

			ctx.beginPath();
			ctx.fillStyle = '#FFF';
			ctx.moveTo(98.952822, 20.866795);
			ctx.bezierCurveTo(98.904902, 18.643590, 98.456902, 9.102967, 94.274511, 7.334309);
			ctx.bezierCurveTo(85.664760, 3.695742, 64.390792, 0.793707, 50.000924, 0.793707);
			ctx.bezierCurveTo(35.608879, 0.793707, 14.334911, 3.695742, 5.725159, 7.334309);
			ctx.bezierCurveTo(1.538956, 9.105144, 1.094751, 18.658832, 1.047390, 20.873328);
			ctx.bezierCurveTo(0.977166, 21.518950, 0.982065, 22.153685, 1.081685, 22.724729);
			ctx.lineTo(1.899873, 27.254429);
			ctx.bezierCurveTo(2.334280, 29.735122, 4.506860, 31.355167, 6.753474, 30.874488);
			ctx.lineTo(25.631126, 26.837986);
			ctx.bezierCurveTo(27.876107, 26.358942, 29.343727, 23.959904, 28.909864, 21.480300);
			ctx.lineTo(27.930000, 15.887446);
			ctx.bezierCurveTo(29.670893, 15.619072, 31.417775, 15.365395, 33.146694, 15.132950);
			ctx.lineTo(32.582727, 24.184184);
			ctx.bezierCurveTo(32.582727, 24.184184, 4.426293, 40.758064, 4.426293, 46.918696);
			ctx.bezierCurveTo(4.426293, 53.078241, 4.426293, 77.011997, 4.426293, 77.011997);
			ctx.lineTo(50.000379, 77.011997);
			ctx.lineTo(95.573378, 77.011997);
			ctx.bezierCurveTo(95.573378, 77.011997, 95.573378, 52.877371, 95.573378, 46.918696);
			ctx.bezierCurveTo(95.573378, 40.960571, 67.416399, 24.184184, 67.416399, 24.184184);
			ctx.lineTo(66.852433, 15.132950);
			ctx.bezierCurveTo(68.582983, 15.365395, 70.328778, 15.619072, 72.069671, 15.887446);
			ctx.lineTo(71.089262, 21.480845);
			ctx.bezierCurveTo(70.654310, 23.960448, 72.123020, 26.359486, 74.367456, 26.838531);
			ctx.lineTo(93.245653, 30.875032);
			ctx.bezierCurveTo(95.491722, 31.355711, 97.664298, 29.735122, 98.098712, 27.254974);
			ctx.lineTo(98.917442, 22.725273);
			ctx.bezierCurveTo(99.017042, 22.153141, 99.023602, 21.516229, 98.952842, 20.866795);
			ctx.moveTo(50.000924, 13.745896);
			ctx.bezierCurveTo(51.751617, 13.745896, 58.461518, 14.092114, 60.450645, 14.370287);
			ctx.bezierCurveTo(60.450645, 14.331097, 59.800123, 23.313193, 59.784337, 23.286519);
			ctx.lineTo(50.000924, 23.286519);
			ctx.lineTo(40.215334, 23.286519);
			ctx.lineTo(39.609451, 14.364844);
			ctx.bezierCurveTo(43.404252, 13.978341, 46.960619, 13.745896, 50.000924, 13.745896);
			ctx.moveTo(50.001468, 64.670593);
			ctx.bezierCurveTo(42.732500, 64.670593, 36.839698, 58.617740, 36.839698, 51.151169);
			ctx.bezierCurveTo(36.839698, 43.685138, 42.732500, 37.632293, 50.001468, 37.632293);
			ctx.bezierCurveTo(57.270982, 37.632293, 63.163783, 43.685138, 63.163783, 51.151169);
			ctx.bezierCurveTo(63.163239, 58.617740, 57.270437, 64.670593, 50.001468, 64.670593);
			ctx.fill();

			ctx.beginPath();
			ctx.strokeStyle = '#1D4E9C';
			ctx.lineWidth  = 2;
			ctx.moveTo(4.426293, 77.011997);
			ctx.lineTo(95.573378, 77.011997);
			ctx.stroke();

		i++;
	});
}

//■ローディングアイコン用 canvas script
//Android がアニメGIF不可のため、canvasでローディングアイコンを描画
//<canvas class="loading_icon" width="16" height="16">ロード中です。</canvas>
$(function(){
	startLoadingIcon();
});
function startLoadingIcon() {
	var i=0;
	$(".loading_icon").each(function(){
		$(this).addClass("loading_icon_"+i);
		var len = 16,// 大きさ
			bars = 6,// 円の数
			r = len / 2,// 内側の円
			timer = 100,//速さ
			class_name = ".loading_icon_"+i,
			c = document.querySelector(class_name).getContext('2d'),
			alphas = [],
			loadingTimer = "loadingTimer"+i;
			dataLoadingColor = $(this).attr('data-loadingColor');//円の色の設定取得
			//円の色の設定があれば（canvas要素に「data-loadingColor属性」があれば）
			if(dataLoadingColor){
				c.fillStyle = dataLoadingColor;//設定の色の円
			}else{
				c.fillStyle ='#FFF';//無ければ白い円
			}
		c.setTransform(1, 0, 0, 1, r, r);
		(loadingTimer = function(){
			c.clearRect(-r, -r, (r * 2), (r * 2));
			for (var i = 0; i < bars; i++) {
				if (alphas.length < bars){ alphas.push(i / bars); }
				c.globalAlpha = alphas[i];
				c.beginPath();
				c.arc(4, 4, 2, 1 * Math.PI / 40, 8 * Math.PI / 80, true);
				c.closePath();
				c.fill();
				c.rotate((360 / bars) * Math.PI / 180);
			}
			alphas.splice(0, 0, alphas[bars]).pop();
			setTimeout(loadingTimer, timer);
		})();
		i++;
	});
}

