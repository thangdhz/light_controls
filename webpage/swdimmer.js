const degToRd = (degrees) => degrees * (Math.PI / 180);
const rdToDeg = (radian) => (radian * 180 / Math.PI + 180);

function distance(x1, y1, x2, y2) {
  let xDistance = x2 - x1;
  let yDistance = y2 - y1;
  return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}

function getCoordinates(e) {
  if (e.type == 'touchstart' || e.type == 'touchmove' || e.type == 'touchend') {
    if (typeof e.originalEvent === 'undefined') {
      return [e.changedTouches[0].pageX, e.changedTouches[0].pageY];
    }
    else {

    }
    console.log(evt)
    // let touch = evt.originalEvent.touches[0] || evt.originalEvent.changedTouches[0];
    // return [touch.pageX, touch.pageY];
    return [0, 0];
  } 
  else if (e.type == 'click' || e.type == 'mousedown' || e.type == 'mouseup' || e.type == 'mousemove' || 
           e.type == 'mouseover'|| e.type=='mouseout' || e.type=='mouseenter' || e.type=='mouseleave') {
    return [e.clientX, e.clientY];
  }

  return [0, 0];
}

function swSetLevel(channel, level) {
  let xhttp = new XMLHttpRequest();

  xhttp.open("GET", `/set/channel=${channel}&level=${level}`, true);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send();
}

function degToLevel(deg) {
  let level = 0;

  if (deg >= 315 && deg <= 360) {
    level = Math.round((deg - 315) / 2.7);
  }
  else if (deg <= 235) {
    level = Math.round((deg + 45) / 2.7);
  }

  return level;
}

function levelToDeg(level) {
  let deg = 315;

  if (level <= 45/2.7) {
    deg = level * 2.7 + 315;
  }
  else {
    deg = level * 2.7 - 45;
  }

  return deg;
}

class swdimmer {
  constructor(name, channel) {
    this.name = name;
    this.channel = channel;
    this.element = document.getElementById(this.name);
    this.ctx = this.element.getContext("2d");
    this.element.width = 1000;
    this.element.height = 700;
    this.enb_slider = false;
    this.is_up = false;
    this.swlevel = 0;
    this.theta = 0.75 * Math.PI;
    this.old_theta = this.theta;
    this.csize = 300;
    this.cx = Math.cos(this.theta) * this.csize + 500;
    this.cy = Math.sin(this.theta) * this.csize + 500;
    this.button = {
      "ADD" : {"x": 880, "y": 588, "R": 40, "st": 0,   "en": 360},
      "SUB" : {"x": 120, "y": 588, "R": 40, "st": 0,   "en": 360},
      "ON"  : {"x": 500, "y": 350, "R":160, "st": 0,   "en": 180},
      "OFF" : {"x": 500, "y": 350, "R":160, "st": 180, "en": 360},
    };

    this.gradientSlider = this.ctx.createLinearGradient(250, 0, 0, 500);
    this.gradientSlider.addColorStop(0, '#f3c852');
    this.gradientSlider.addColorStop(1, '#f5e1a5');

    this.gradientBackgroundSlider = this.ctx.createLinearGradient(250, 0, 0, 500);
    this.gradientBackgroundSlider.addColorStop(1, '#3E3D31');

    window.addEventListener('load', _ => {
      let render = this.swRender.bind(this);
      window.requestAnimationFrame(render);
    })
    
    document.addEventListener('mousedown', e => {
      let [realX, realY] = this.getRealCoordinates(this.cx, this.cy);
      let d = distance(e.clientX, e.clientY, realX, realY);
      if (d < 32) {
        this.enb_slider = true;
      }
    })
    
    document.addEventListener('mouseup', e => {
      this.enb_slider = false;
    })

    document.addEventListener('mousemove', e => {
      let [x, y] = getCoordinates(e);
      this.sliderHandle(x, y);
    })
    
    document.addEventListener('touchstart', e => {
      let [x, y] = getCoordinates(e);
      let [realX, realY] = this.getRealCoordinates(this.cx, this.cy);
      let d = distance(x, y, realX, realY);
      if (d < 32) {
        this.enb_slider = true;
      }
    })
    
    document.addEventListener('touchend', e => {
      this.enb_slider = false;
    })
    
    document.addEventListener('touchmove', e => {
      let [x, y] = getCoordinates(e);
      e.preventDefault();
      this.sliderHandle(x, y);
    })
    
    document.addEventListener('click', e => {
      let [x, y] = getCoordinates(e);
      for (const [name, btn] of Object.entries(this.button)) {
        let [realX, realY] = this.getRealCoordinates(btn["x"], btn["y"]);
        let d = distance(x, y, realX, realY);
        let deg = Math.atan2(y - realY, x - realX) * 180 / Math.PI + 180;
        if (d <= btn["R"] & btn["st"] < deg & btn["en"] > deg) {
          this.onButtonClick(name);
        }
      }
    })
  };

  updateLevel(level) {
    console.log(`>> Channel ${this.channel} update level ${level}`);
    this.swlevel = level;
    this.theta = degToRd(levelToDeg(this.swlevel)) - Math.PI;
    this.swRender();
  }

  getRealCoordinates(x, y) {
    let scaleX = this.element.getBoundingClientRect().width / this.element.width;
    let scaleY = this.element.getBoundingClientRect().height / this.element.height;
    let offsetX = this.element.offsetLeft;
    let offsetY = this.element.offsetTop;
    let realX = x * scaleX + offsetX;
    let realY = y * scaleY + offsetY;
    return [realX, realY]
  }

  onButtonClick(name) {
    if (name == "ON") {
      this.swlevel = 100;
    }
    else if (name == "OFF") {
      this.swlevel = 0;
    }
    else if (name == "ADD") {
      this.swlevel += 1;
      if (this.swlevel > 100) {
        this.swlevel = 100;
      }
    }
    else if (name == "SUB") {
      this.swlevel -= 1;
      if (this.swlevel < 0) {
        this.swlevel = 0;
      }
    }
  
    this.theta = degToRd(levelToDeg(this.swlevel)) - Math.PI;
    swSetLevel(this.channel, this.swlevel);
  };
  
  onSliderChange(level) {
    console.log(`==> New level ${level}`)
    this.swlevel = level;
    swSetLevel(this.channel, this.swlevel);
  };
  
  sliderHandle(x, y) {
    if (this.enb_slider) {
      let [realX, realY] = this.getRealCoordinates(500, 500);
      let current = Math.atan2(y - realY, x - realX);
      let d = distance(x, y, realX, realY);
      let deg = rdToDeg(current);
  
      if (current > 0.25 * Math.PI & current < 0.75 * Math.PI) {
        if (this.old_theta <= 0.25 * Math.PI) {
          this.theta = 0.25 * Math.PI;
        }
        else {
          this.theta = 0.75 * Math.PI;
        }
      }
      else {
        this.theta = current;
      }
  
      this.old_theta = this.theta;  
      deg = rdToDeg(this.theta);
      this.onSliderChange(degToLevel(deg));
    }
    else {
      // console.log(`MOVE ===== [${x}-${y}]`);
    }
  };
  
  swRender() {
    this.ctx.clearRect(0, 0, this.element.width, this.element.height);
    this.ctx.fillStyle = '#444444';
    this.ctx.lineCap = 'round';
  
    this.ctx.beginPath();
    this.ctx.arc(this.button["OFF"]["x"], this.button["OFF"]["y"], this.button["OFF"]["R"], 0, Math.PI, false);
    this.ctx.fillStyle = '#e5e4e0';
    this.ctx.fill();
    this.ctx.strokeStyle = '#e5e4e0';
    this.ctx.stroke();
  
    this.ctx.beginPath();
    this.ctx.arc(this.button["ON"]["x"], this.button["ON"]["y"], this.button["ON"]["R"], Math.PI, 2 * Math.PI, false);
    this.ctx.fillStyle = '#f3dd88';
    this.ctx.fill();
    this.ctx.strokeStyle = '#f3dd88';
    this.ctx.stroke();
  
    this.ctx.beginPath();
    this.ctx.lineWidth = 0;
    this.ctx.arc(500, 350, 68, 0, 2 * Math.PI, false);
    this.ctx.fillStyle = '#e9e6dc';
    this.ctx.fill();
    this.ctx.strokeStyle = '#afa27b';
    this.ctx.stroke();
  
    this.ctx.font = "52px Arial";
    this.ctx.fillStyle = "#df8830";
    this.ctx.textAlign = "center";
    this.ctx.fillText("ON", 500, 258);
  
    this.ctx.font = "52px Arial";
    this.ctx.fillStyle = "#9c9b97";
    this.ctx.textAlign = "center";
    this.ctx.fillText("OFF", 500, 480);
  
    this.ctx.font = "36px Arial";
    this.ctx.fillStyle = "#888888";
    this.ctx.textAlign = "center";
    this.ctx.fillText(`${this.swlevel}%`, 508, 365);
  
    this.ctx.beginPath();
    this.ctx.arc(this.button["ADD"]["x"], this.button["ADD"]["y"], this.button["ADD"]["R"], 0, 2 * Math.PI);
    this.ctx.arc(this.button["SUB"]["x"], this.button["SUB"]["y"], this.button["SUB"]["R"], 0, 2 * Math.PI);
    this.ctx.fillStyle = '#626262';
    this.ctx.fill();
  
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.lineWidth = 4;
    this.ctx.moveTo(860, 588);
    this.ctx.lineTo(900, 588);
    this.ctx.moveTo(880, 570);
    this.ctx.lineTo(880, 606);
    this.ctx.moveTo(100, 588);
    this.ctx.lineTo(140, 588);
    this.ctx.stroke();
    this.ctx.closePath();
  
    this.ctx.beginPath();
    this.ctx.arc(500, 350, 300, 0.75 * Math.PI, 0.25 * Math.PI);
    this.ctx.strokeStyle = this.gradientBackgroundSlider;
    this.ctx.lineWidth = 50;
    this.ctx.stroke();
  
    this.ctx.beginPath();
    this.ctx.arc(500, 350, 300, 0.75 * Math.PI, this.theta);
    this.ctx.strokeStyle = this.gradientSlider;
    this.ctx.lineWidth = 50;
    this.ctx.stroke();
    this.ctx.restore();
  
    this.cx = Math.cos(this.theta) * this.csize + 500;
    this.cy = Math.sin(this.theta) * this.csize + 350;
    this.ctx.beginPath();
    this.ctx.arc(this.cx, this.cy, 32, 0, 2 * Math.PI);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fill();
  
    let render = this.swRender.bind(this);
    window.requestAnimationFrame(render);
  };
};

swdimmerch0 = new swdimmer("swdimmerch0", 0);
swdimmerch1 = new swdimmer("swdimmerch1", 1);
const arrchannel = [swdimmerch0, swdimmerch1];

function swGetLevel() {
  let xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function() {
    if (xhttp.readyState === 4) {
      const arrlevel = JSON.parse(xhttp.response);
      arrchannel[arrlevel[0]["channel"]].updateLevel(arrlevel[0]["level"])
      arrchannel[arrlevel[1]["channel"]].updateLevel(arrlevel[1]["level"])
    }
  }

  xhttp.open("GET", `/getlevel`, true);
  xhttp.send();
}

swGetLevel();