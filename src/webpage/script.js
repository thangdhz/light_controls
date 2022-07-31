const degToRd = (degrees) => degrees * (Math.PI / 180);
const rdToDeg = (radian) => (radian * 180 / Math.PI + 180);
var swLevels = [0, 0, 0];
var dvLevels = [0, 0, 0];
var icnt = 0;

function zeroPad(nr, base) {
  var  len = (String(base).length - String(nr).length) + 1;
  return len > 0? new Array(len).join('0') + nr : nr;
}

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
  swLevels[channel] = level;
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

class timepicker {
  constructor(name) {
    this.name = name;
    this.element = document.getElementById(this.name);
    this.ctx = this.element.getContext("2d");
    this.element.width  = 1000;
    this.element.height = 1000;
    this.list_btn_day = {"x": 60, "y": 900, "R": 46 };
    this.enb_day = [0, 0, 0, 0, 0, 0, 0];
    this.enb_slider = false;
    this.slider = { 
      "ww": { "x": 130, "y": 610, "w": 820, "h": 20, "sx": 130, "sy": 620, "tx": 60, "ty": 636, "enb": false },
      "cw": { "x": 130, "y": 738, "w": 820, "h": 20, "sx": 130, "sy": 748, "tx": 60, "ty": 764, "enb": false },
    };
    this.swlevel = {
      "ww": 0, 
      "cw": 0
    };
    this.cfbtn = {
      "SAV"  : {"x": 590, "y": 104, "w": 300, "h": 160, "tx": 740, "ty":202 , "txt": "Save"},
      "DEL"  : {"x": 590, "y": 310, "w": 300, "h": 160, "tx": 740, "ty":420 , "txt": "Delete"},
    }
    this.hour = 0;
    this.min = 0;
    this.pickxy = [0, 0];
    this.pickstart = 0;

    this.gradientSlider = this.ctx.createLinearGradient(250, 0, 0, 500);
    this.gradientSlider.addColorStop(0, '#f3c852');
    this.gradientSlider.addColorStop(1, '#f5e1a5');

    this.gradientBackgroundSlider = this.ctx.createLinearGradient(250, 0, 0, 500);
    this.gradientBackgroundSlider.addColorStop(1, '#3E3D31');
    window.addEventListener('load', _ => {
      let render = this.tmRender.bind(this);
      window.requestAnimationFrame(render);
    })

    document.addEventListener('mousedown', e => {
      let [x, y] = getCoordinates(e);

      for (const [name, sldr] of Object.entries(this.slider)) {
        let [realX, realY] = this.getRealCoordinates(sldr["sx"], sldr["sy"]);
        let d = distance(x, y, realX, realY);
        if (d < 26) {
          sldr["enb"] = true;
        }
      }

      this.pickxy = [x, y];
      this.pickstart = Date.now();
    })

    document.addEventListener('mouseup', e => {
      let [x, y] = getCoordinates(e);

      for (const [name, sldr] of Object.entries(this.slider)) {
        sldr["enb"] = false;
      }

      let [realXhh, realYhh] = this.getRealCoordinates(130, 100);
      let [realXmm, realYmm] = this.getRealCoordinates(330, 356 + 120);
      let picktime = Math.round(600 / (Date.now() - this.pickstart));
      if (this.pickxy[1] > realYmm || this.pickxy[1] < realYhh) {
        return;
      }
      if (x == this.pickxy[0] && y == this.pickxy[1]) {
        return;
      }
      if (y < this.pickxy[1]) {
        if (realXhh < x && x < realXhh + 180 * this.scaleX()) {
          this.hour += picktime;
        }
        else if (realXmm < x && x < realXmm + 180 * this.scaleX()) {
          this.min += picktime;
        }
      }
      else {
        if (realXhh < x && x < realXhh + 180 * this.scaleX()) {
          this.hour -= picktime;
        }
        else if (realXmm < x && x < realXmm + 180 * this.scaleX()) {
          this.min -= picktime;
        }
      } 
      if (this.hour > 23) { this.hour = 0;  }
      if (this.hour < 0 ) { this.hour = 23; }
      if (this.min  > 59) { this.min  = 0;  }
      if (this.min  < 0 ) { this.min  = 59; }
    })

    document.addEventListener('mousemove', e => {
      let [x, y] = getCoordinates(e);

      for (const [name, sldr] of Object.entries(this.slider)) {
        let [realX, realY] = this.getRealCoordinates(sldr["x"], sldr["y"]);
        
        if (!sldr["enb"]) {
          continue;
        }

        if (realY - 26 < y && y < realY + 26) {
          if (realX < x  && x < realX + sldr["w"] * this.scaleX()) {
            sldr["sx"] = sldr["x"] + (x - realX) / this.scaleX();
            this.swlevel[name] = Math.round((x - realX)/ (sldr["w"] * this.scaleX()) * 100);
          }
        }
      }
    })
    
    document.addEventListener('touchstart', e => {
      // e.preventDefault();
      let [x, y] = getCoordinates(e);

      for (const [name, sldr] of Object.entries(this.slider)) {
        let [realX, realY] = this.getRealCoordinates(sldr["sx"], sldr["sy"]);
        let d = distance(x, y, realX, realY);
        if (d < 26) {
          sldr["enb"] = true;
        }
      }

      this.pickxy = [x, y];
      this.pickstart = Date.now();
    }, {passive: false})
    
    document.addEventListener('touchend', e => {
      // e.preventDefault();

      for (const [name, sldr] of Object.entries(this.slider)) {
        sldr["enb"] = false;
      }

      let [x, y] = getCoordinates(e);
      let [realXhh, realYhh] = this.getRealCoordinates(130, 100);
      let [realXmm, realYmm] = this.getRealCoordinates(330, 356 + 120);
      let picktime = Math.round(500 / (Date.now() - this.pickstart));
      if (this.pickxy[1] > realYmm || this.pickxy[1] < realYhh) {
        return;
      }
      if (x == this.pickxy[0] && y == this.pickxy[1]) {
        return;
      }
      if (y < this.pickxy[1]) {
        if (realXhh < x && x < realXhh + 180 * this.scaleX()) {
          this.hour += picktime;
        }
        else if (realXmm < x && x < realXmm + 180 * this.scaleX()) {
          this.min += picktime;
        }
      }
      else {
        if (realXhh < x && x < realXhh + 180 * this.scaleX()) {
          this.hour -= picktime;
        }
        else if (realXmm < x && x < realXmm + 180 * this.scaleX()) {
          this.min -= picktime;
        }
      } 
      if (this.hour > 23) { this.hour = 0;  }
      if (this.hour < 0 ) { this.hour = 23; }
      if (this.min  > 59) { this.min  = 0;  }
      if (this.min  < 0 ) { this.min  = 59; }
    }, {passive: false})
    
    document.addEventListener('touchmove', e => {
      // e.preventDefault();
      let [x, y] = getCoordinates(e);
      
      for (const [name, sldr] of Object.entries(this.slider)) {
        let [realX, realY] = this.getRealCoordinates(sldr["x"], sldr["y"]);
        
        if (!sldr["enb"]) {
          continue;
        }

        if (realY - 26 < y && y < realY + 26) {
          if (realX < x  && x < realX + sldr["w"] * this.scaleX()) {
            sldr["sx"] = sldr["x"] + (x - realX) / this.scaleX();
            this.swlevel[name] = Math.round((x - realX)/ (sldr["w"] * this.scaleX()) * 100);
          }
        }
      }
    }, {passive: false})
    
    document.addEventListener('click', e => {
      let [x, y] = getCoordinates(e);
      // handle button day
      let bx = this.list_btn_day["x"];
      let by = this.list_btn_day["y"];
      let br = this.list_btn_day["R"] * this.scaleXY();
      for (let i = 0; i < 7; i++) {
        let [realX, realY] = this.getRealCoordinates(bx, by);
        let d = distance(x, y, realX, realY);
        if (d <= br) {
          this.enb_day[i] = !this.enb_day[i];
        }
        bx += 148;
      }
      // handle button config
      for (const [name, btn] of Object.entries(this.cfbtn)) {
        let [realX, realY] = this.getRealCoordinates(btn["x"], btn["y"]);
        if (realX < x && x < realX + btn["w"] * this.scaleX()) {
          if (realY < y && y < realY + btn["h"] * this.scaleY()) {
            this.onButtonClick(name);
          }
        }
      }
    }, {passive: false})
  }

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

  scaleX() {
    return this.element.getBoundingClientRect().width / this.element.width;
  }

  scaleY() {
    return this.element.getBoundingClientRect().height / this.element.height;
  }

  scaleXY() {
    let scaleX = this.element.getBoundingClientRect().width / this.element.width;
    let scaleY = this.element.getBoundingClientRect().height / this.element.height;

    // return (Math.sqrt((scaleX * scaleX) + (scaleY * scaleY)));
    return scaleX;
  }

  offsetX() {
    return this.element.offsetLeft;
  }

  offsetY() {
    return this.element.offsetTop;
  }

  onButtonClick(name) {
    if (name == "DEL") {

    }
    else if (name == "SAV") {

    }
  }

  tmRender() {
    this.ctx.clearRect(0, 0, this.element.width, this.element.height);
    this.ctx.fillStyle = '#444444';

    for (const [name, sldr] of Object.entries(this.slider)) {
      this.ctx.beginPath();
      this.ctx.fillStyle = this.gradientBackgroundSlider;
      this.ctx.fillRect(sldr["x"], sldr["y"], sldr["w"], sldr["h"]);
      this.ctx.fill();

      this.ctx.beginPath();
      this.ctx.fillStyle = this.gradientSlider;
      this.ctx.fillRect(sldr["x"], sldr["y"], sldr["sx"] - sldr["x"], sldr["h"]);
      this.ctx.fill();

      this.ctx.beginPath();
      this.ctx.arc(sldr["sx"], sldr["sy"], 26, 0, 2 * Math.PI);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fill();

      this.ctx.font = "33px Arial";
      this.ctx.fillStyle = "#ffffff";
      this.ctx.textAlign = "center";
      this.ctx.fillText(`${this.swlevel[name]}%`, sldr["tx"], sldr["ty"]);
    }

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.fillStyle = '#444444';
    this.ctx.fillRect(110, 80, 800, 420);
    this.ctx.fill();
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = '#afa27b';
    this.ctx.stroke();
    this.ctx.restore();

    this.ctx.beginPath();
    this.ctx.fillStyle = this.gradientBackgroundSlider;
    this.ctx.fillRect(130, 100, 180, 120);
    this.ctx.fillRect(130, 356, 180, 120);
    this.ctx.fillRect(330, 100, 180, 120);
    this.ctx.fillRect(330, 356, 180, 120);
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.fillStyle = "#764382";
    this.ctx.fillRect(130, 228, 180, 120);
    this.ctx.fillRect(330, 228, 180, 120);
    this.ctx.fill();

    let h1 = this.hour == 0 ? 23 : this.hour - 1;
    let h2 = this.hour;
    let h3 = this.hour == 23 ? 0 : this.hour + 1;
    let m1 = this.min == 0 ? 59 : this.min - 1;
    let m2 = this.min;
    let m3 = this.min == 59 ? 0 : this.min + 1;
    this.ctx.font = "98px Roboto";
    this.ctx.textAlign = "center";
    this.ctx.fillStyle = "#9c9b97";
    this.ctx.fillText(`${zeroPad(h1, 10)}`, 218, 192);
    this.ctx.fillText(`${zeroPad(h3, 10)}`, 218, 442);
    this.ctx.fillText(`${zeroPad(m1, 10)}`, 418, 192);
    this.ctx.fillText(`${zeroPad(m3, 10)}`, 418, 442);
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillText(`${zeroPad(h2, 10)}`, 218, 318);
    this.ctx.fillText(`${zeroPad(m2, 10)}`, 418, 318);
    this.ctx.fillText(":", 319, 312);

    this.ctx.beginPath();
    this.ctx.fillStyle = "#afa27b";
    this.ctx.fillRect(this.cfbtn["DEL"]["x"] - 4, this.cfbtn["DEL"]["y"] - 4, this.cfbtn["DEL"]["w"] + 8, this.cfbtn["DEL"]["h"] + 8);
    this.ctx.fillRect(this.cfbtn["SAV"]["x"] - 4, this.cfbtn["SAV"]["y"] - 4, this.cfbtn["SAV"]["w"] + 8, this.cfbtn["SAV"]["h"] + 8);
    this.ctx.fillStyle = "#3E3D31";
    this.ctx.fillRect(this.cfbtn["DEL"]["x"], this.cfbtn["DEL"]["y"], this.cfbtn["DEL"]["w"], this.cfbtn["DEL"]["h"]);
    this.ctx.fillRect(this.cfbtn["SAV"]["x"], this.cfbtn["SAV"]["y"], this.cfbtn["SAV"]["w"], this.cfbtn["SAV"]["h"]);
    this.ctx.fill();
    this.ctx.font = "68px Roboto";
    this.ctx.textAlign = "center";
    this.ctx.fillStyle = "#9c9b97";
    this.ctx.fillText(this.cfbtn["DEL"]["txt"], this.cfbtn["DEL"]["tx"], this.cfbtn["DEL"]["ty"]);
    this.ctx.fillText(this.cfbtn["SAV"]["txt"], this.cfbtn["SAV"]["tx"], this.cfbtn["SAV"]["ty"]);

    let bx = this.list_btn_day["x"];
    let by = this.list_btn_day["y"];
    let dd = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    for (let i = 0; i < 7; i++) {
      this.ctx.beginPath();
      this.ctx.arc(bx, by, this.list_btn_day["R"], 0, 2 * Math.PI);
      if (this.enb_day[i]) {
        this.ctx.fillStyle = "#27B63F"
      }
      else {
        this.ctx.fillStyle = "#3E3D31";
      }
      this.ctx.fill();
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = '#afa27b';
      this.ctx.stroke();

      this.ctx.font = "33px Arial";
      this.ctx.fillStyle = "#ffffff";
      this.ctx.textAlign = "center";
      this.ctx.fillText(dd[i], bx, by + 10);
      bx += 148;
    }
    
    let render = this.tmRender.bind(this);
    window.requestAnimationFrame(render);
  }
}

swdimmerch0 = new swdimmer("swdimmerch0", 0);
swdimmerch1 = new swdimmer("swdimmerch1", 1);
timepicker0 = new timepicker("timepicker")
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

function swULLevel() {
  icnt++;
  let idx = icnt % 2;
  if (dvLevels[idx] != swLevels[idx]) {
    dvLevels[idx] = swLevels[idx];
    let xhttp = new XMLHttpRequest();
    xhttp.open("GET", `/set/channel=${idx}&level=${dvLevels[idx]}`, true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send();
  }
}

function sensorGet() {
  let xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function() {
    if (xhttp.readyState === 4) {
      const sensorlevel = JSON.parse(xhttp.response);
      document.getElementById("sensor").innerHTML = `Temperature ${sensorlevel["temperature"]} oC, Humidity ${sensorlevel["humidity"]} %`
    }
  }

  xhttp.open("GET", `/getsensor`, true);
  xhttp.send();
}

swGetLevel();
sensorGet();
setInterval(sensorGet, 2000);
setInterval(swULLevel, 250);