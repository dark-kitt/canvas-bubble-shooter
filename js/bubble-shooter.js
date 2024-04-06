window.onload = function() {
    var initBubbles = function(parent, append) {

        var canvas = hiDPICanvas('bubbles-canvas', window.innerWidth, window.innerHeight);

        if (append) { parent.appendChild(canvas); } else { parent.insertBefore(canvas, parent.firstChild); }

        var can = gid('bubbles-canvas'),
            ctx = can.getContext('2d');

        var maxBubbles = 50,
            minRadius = 10,
            maxRadius = 50,
            minSpeed = 5,
            maxSpeed = 8,
            hit = false,
            bubbleHits = [],
            maxFlakes = 12,
            flakes = [],
            color, gcolor, radius, xcoord, ycoord,
            createObjs = function(xcoord, ycoord, radius, minSpeed, maxSpeed, color, gcolor) {
                var obj = {
                    xcoord: xcoord,
                    ycoord: ycoord,
                    radius: radius,
                    collision: [true, false][randomInt(0, 1)],
                    md: ['left', 'right'][randomInt(0, 1)],
                    ms: [minSpeed, maxSpeed][randomInt(0, 1)],
                    color: color,
                    xgradient: xcoord,
                    ygradient: ycoord,
                    cgradient: gcolor,
                    rgradient: randomInt(fixValue((radius / 4), 0), fixValue((radius / 2), 0)),
                    mdxgradient: ['left', 'right'][randomInt(0, 1)],
                    mdygradient: ['top', 'bottom'][randomInt(0, 1)],
                    draw: function(can, ctx) {
                        this.ycoord -= this.ms;
                        this.xcoord = (this.md === 'left') ? this.xcoord -= 1 : this.xcoord += 1;

                        this.ygradient -= this.ms;
                        this.xgradient = (this.md === 'left') ? this.xgradient -= 1 : this.xgradient += 1;

                        if ((this.xcoord - this.radius) <= 0) {
                            this.md = 'right';
                        }
                        if ((this.xcoord + this.radius) >= (can.width / pixelRatio)) {
                            this.md = 'left';
                        }

                        var circle = {
                                radius: (this.radius - 15),
                                xcoord: this.xcoord,
                                ycoord: this.ycoord
                            },
                            innerCircle = {
                                radius: this.rgradient,
                                xcoord: this.xgradient,
                                ycoord: this.ygradient
                            },
                            reset = ((this.rgradient / 100) * 4),
                            count = (this.rgradient / 100),
                            grow = ((this.rgradient / 100) / 5);
                        switch (this.mdxgradient) {
                            case 'left':
                                if (circleColliding(circle, innerCircle, true)) {
                                    this.mdxgradient = 'right';
                                    this.xgradient += reset;
                                } else {
                                    this.xgradient -= count;
                                    if (this.rgradient + grow < (this.radius / 2)) {
                                        this.rgradient += grow;
                                    }
                                }
                                break;
                            case 'right':
                                if (circleColliding(circle, innerCircle, true)) {
                                    this.mdxgradient = 'left';
                                    this.xgradient -= reset;
                                } else {
                                    this.xgradient += count;
                                    if (this.rgradient - grow > (this.radius / 4)) {
                                        this.rgradient -= grow;
                                    }
                                }
                                break;
                            default:
                                break;
                        }
                        switch (this.mdygradient) {
                            case 'top':
                                if (circleColliding(circle, innerCircle, true)) {
                                    this.mdygradient = 'bottom';
                                    this.ygradient += reset;
                                } else {
                                    this.ygradient -= count;
                                    if (this.rgradient + grow < (this.radius / 2)) {
                                        this.rgradient += grow;
                                    }
                                }
                                break;
                            case 'bottom':
                                if (circleColliding(circle, innerCircle, true)) {
                                    this.mdygradient = 'top';
                                    this.ygradient -= reset;
                                } else {
                                    this.ygradient += count;
                                    if (this.rgradient - grow > (this.radius / 4)) {
                                        this.rgradient -= grow;
                                    }
                                }
                                break;

                            default:
                                break;
                        }

                        ctx.beginPath();
                        ctx.arc(this.xcoord, this.ycoord, this.radius, 0, (Math.PI * 2), false);
                        var gradient = ctx.createRadialGradient(
                            this.xgradient,
                            this.ygradient,
                            this.rgradient,
                            this.xcoord,
                            this.ycoord,
                            this.radius
                        );
                        gradient.addColorStop(0.15, this.cgradient);
                        gradient.addColorStop(0.95, this.color);
                        ctx.fillStyle = gradient;
                        ctx.fill();
                        ctx.lineWidth = 1;
                        ctx.strokeStyle = "rgba(255,255,255,0.1)";
                        ctx.stroke();
                        ctx.closePath();
                    }
                };
                return obj;
            },
            createBubbles = function(can, allBubbles, maxBubbles, minRadius, maxRadius, minSpeed, maxSpeed) {
                var length = maxBubbles;
                while (length--) {
                    if (allBubbles.length < maxBubbles) {
                        alpha = (randomInt(40, 68) / 100);
                        color = randomRGBA(110, 210, alpha);
                        gcolor = 'rgba(' + color.match(/\d+/g)[0] + ', ' + color.match(/\d+/g)[1] + ', ' + color.match(/\d+/g)[2] + ',' + (alpha / 2) + ')';
                        radius = randomInt(minRadius, maxRadius);
                        xcoord = randomInt(0, (can.width / pixelRatio));
                        ycoord = ((can.height / pixelRatio) + (radius * 2));

                        allBubbles.push(createObjs(xcoord, ycoord, radius, minSpeed, maxSpeed, color, gcolor));
                    }
                }
                return allBubbles;
            },
            circleColliding = function(circle, circles, inset) {
                var r, x, y;

                if (inset === true) {
                    r = circle.radius - circles.radius;
                    x = Math.abs(circle.xcoord - circles.xcoord);
                    y = Math.abs(circle.ycoord - circles.ycoord);

                    if (r < Math.sqrt((x * x) + (y * y))) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    r = circle.radius + circles.radius;
                    x = Math.abs(circle.xcoord - circles.xcoord);
                    y = Math.abs(circle.ycoord - circles.ycoord);

                    if (r > Math.sqrt((x * x) + (y * y))) {
                        return true;
                    } else {
                        return false;
                    }
                }
            },
            handleColliding = function(circle, circles, circleMS, circlesMS) {
                if (circle.xcoord > circles.xcoord && circle.ycoord < circles.ycoord) {

                    if (circle.ms >= circles.ms) {

                        if (circle.md === 'left' && circles.md === 'right') {
                            circle.ms = ((circle.ms += 1) < maxSpeed) ? circle.ms += 1 : maxSpeed;
                            circles.ms = ((circles.ms -= 1) > minSpeed) ? circles.ms -= 1 : minSpeed;

                            circle.md = 'right';
                            circles.md = 'left';
                        } else {
                            circle.ms = ((circle.ms += 1) < maxSpeed) ? circle.ms += 1 : maxSpeed;
                            circles.ms = ((circles.ms -= 1) > minSpeed) ? circles.ms -= 1 : minSpeed;
                        }
                    }

                    if (circle.ms <= circles.ms) {

                        if (circle.md === 'left' && circles.md === 'right') {
                            circle.ms = circlesMS;
                            circles.ms = circleMS;

                            circle.md = 'right';
                            circles.md = 'left';
                        } else {
                            circle.ms = circlesMS;
                            circles.ms = circleMS;
                        }
                    }

                }

                if (circle.xcoord < circles.xcoord && circle.ycoord < circles.ycoord) {

                    if (circle.ms >= circles.ms) {

                        if (circle.md === 'right' && circles.md === 'left') {
                            circle.ms = ((circle.ms += 1) < maxSpeed) ? circle.ms += 1 : maxSpeed;
                            circles.ms = ((circles.ms -= 1) > minSpeed) ? circles.ms -= 1 : minSpeed;

                            circle.md = 'left';
                            circles.md = 'right';
                        } else {
                            circle.ms = ((circle.ms += 1) < maxSpeed) ? circle.ms += 1 : maxSpeed;
                            circles.ms = ((circles.ms -= 1) > minSpeed) ? circles.ms -= 1 : minSpeed;
                        }

                    }

                    if (circle.ms <= circles.ms) {

                        if (circle.md === 'right' && circles.md === 'left') {
                            circle.ms = circlesMS;
                            circles.ms = circleMS;

                            circle.md = 'left';
                            circles.md = 'right';
                        } else {
                            circle.ms = circlesMS;
                            circles.ms = circleMS;
                        }

                    }

                }
            },
            allBubbles = [],
            startTime = (!window.performance.now) ? new Date().getTime() : performance.now(),
            fps = 30,
            interval = fixValue(1000 / fps, 0),
            request = {
                id: null
            },
            loop = function(can, ctx, objs) {

                var currentTime = (!window.performance.now) ? new Date().getTime() : performance.now(),
                    difference = currentTime - startTime,
                    i = objs.length;

                if (difference >= interval) {

                    startTime = currentTime - (difference % interval);

                    clearCanvas(can);

                    while (i--) {

                        objs[i].draw(can, ctx);

                        if ((objs[i].ycoord + (objs[i].radius * 2)) < 0) {
                            objs.splice(i, 1);
                            objs = createBubbles(can, objs, maxBubbles, minRadius, maxRadius, minSpeed, maxSpeed);
                        }

                        var arr = [];
                        if ((i - 1) > 0) {
                            arr.push(objs.slice(0, (i - 1)));
                        }
                        if ((i + 1) < objs.length) {
                            arr.push(objs.slice(i + 1));
                        }
                        arr = [].concat.apply([], arr);

                        var j = arr.length;
                        while (j--) {

                            if (circleColliding(objs[i], arr[j], false) && objs[i].collision === true && arr[j].collision === true) {
                                handleColliding(objs[i], arr[j], objs[i].ms, arr[j].ms);
                            }

                        }

                    }

                    if (hit === true) {
                        var k = flakes.length;

                        while (k--) {
                            var l = flakes[k].length;

                            while (l--) {
                                flakes[k][l].draw(can, ctx, l);

                                if (flakes[k][l].fr === 0) {
                                    flakes[k].splice(l, 1);
                                }
                            }

                            if (flakes[k].length === 0) {
                                flakes.splice(k, 1);
                            }

                        }
                    }

                    if (flakes.length === 0) {
                        hit = false;
                    }

                }

                request.id = startAnimation(can, ctx, objs, loop);

                canvasAnimations.initBubbles.objs = objs;
                canvasAnimations.initBubbles.request = request.id;
                canvasAnimations.initBubbles.running = true;
            },
            createFlake = function(fx, fy, fc, fr) {
                var obj = {
                    fx: fx,
                    fy: fy,
                    fc: fc,
                    fr: fr,
                    spreadx: (randomInt(100, 300) / 100),
                    spready: (randomInt(100, 300) / 100),
                    draw: function(can, ctx, fdir) {
                        var fraction = ((fdir + 1) / 4);

                        if (getFraction(fraction) === 0) {
                            this.fx += this.spreadx;
                            this.fy -= this.spready;
                        }
                        if (getFraction(fraction) === 0.25) {
                            this.fx += this.spreadx;
                            this.fy += this.spready;
                        }
                        if (getFraction(fraction) === 0.50) {
                            this.fx -= this.spreadx;
                            this.fy += this.spready;
                        }
                        if (getFraction(fraction) === 0.75) {
                            this.fx -= this.spreadx;
                            this.fy -= this.spready;
                        }

                        this.fr = ((this.fr - 1) >= 0) ? this.fr -= 1 : 0;

                        ctx.beginPath();
                        ctx.arc(this.fx, this.fy, this.fr, 0, (Math.PI * 2), false);
                        ctx.fillStyle = 'rgba(' + this.fc.match(/\d+/g)[0] + ', ' + this.fc.match(/\d+/g)[1] + ', ' + this.fc.match(/\d+/g)[2] + ', 0.23)';
                        ctx.fill();
                        ctx.closePath();
                    }
                };
                return obj;
            },
            hitcounter = function(event, objs) {

                var x = event.pageX,
                    y = event.pageY,
                    i = objs.length,
                    tempFlakes = [],
                    hitCounter = canvasAnimations.initBubbles.hits;

                while (i--) {

                    if (x < (objs[i].xcoord + objs[i].radius) && x > (objs[i].xcoord - objs[i].radius) &&
                        y < (objs[i].ycoord + objs[i].radius) && y > (objs[i].ycoord - objs[i].radius)) {

                        hit = true;
                        var flakesVal = {
                            x: objs[i].xcoord,
                            y: objs[i].ycoord,
                            c: objs[i].color,
                            r: objs[i].radius
                        };
                        tempFlakes.push(flakesVal);

                        objs.splice(i, 1);
                        objs = createBubbles(can, objs, maxBubbles, minRadius, maxRadius, minSpeed, maxSpeed);

                        hitCounter.push(i);
                        gid('hit-counter').innerHTML = 'score: ' + hitCounter.length;
                    }
                }

                if (tempFlakes.length > 0) {
                    var j = tempFlakes.length;

                    while (j--) {
                        var k = maxFlakes,
                            fx = tempFlakes[j].x,
                            fy = tempFlakes[j].y,
                            fc = tempFlakes[j].c,
                            fr = (tempFlakes[j].r / 4),
                            fArr = [];

                        while (k--) {
                            fArr.push(createFlake(fx, fy, fc, fr));
                        }

                        flakes.push(fArr);
                    }
                }

            },
            events = function(can, ctx, objs, loop) {
                var kitchenKnife = gid('cursor');

                can.addEventListener('click', function(event) {
                    hitcounter(event, objs);
                });
                can.addEventListener('touch', function(event) {
                    hitcounter(event, objs);
                });
            };

        allBubbles = createBubbles(can, allBubbles, maxBubbles, minRadius, maxRadius, minSpeed, maxSpeed);

        events(can, ctx, allBubbles, loop, request);
        request.id = startAnimation(can, ctx, allBubbles, loop);

        canvasAnimations.initBubbles = {
            can: can,
            ctx: ctx,
            objs: allBubbles,
            loop: loop,
            request: request.id,
            events: events,
            running: false,
            hits: []
        };

    };

    initBubbles(gid('bubble-shooter'), true);
    stopAnimation(canvasAnimations.initBubbles.request);

    var button = gid('button'),
        hitcounter = gid('hit-counter'),
        overlay = gid('overlay'),
        input = gid('input'),
        highscoreList = gid('highscore-list'),
        timerVal = gid('timer-val'),
        cleanHighscore = function() {
            var highscoreLI = gtn('li'),
                i = highscoreLI.length;
            while (i--) {
                highscoreLI[i].remove();
                if (i === 1) {
                    break;
                }
            }
        },
        updateHighscore = function(lsObj) {
            var i = lsObj.length;
            lsObj.sort(function(a, b) {
                return a.score - b.score;
            });

            while (i--) {
                var li = document.createElement('LI'),
                    p = document.createElement('P'),
                    node = document.createTextNode(lsObj[i].name + ': ' + lsObj[i].score);

                    p.appendChild(node);
                    li.appendChild(p);

                    highscoreList.append(li);
            }
        };

    hitcounter.innerHTML = 'score: ' + 0;

    try {
        var lsObj = JSON.parse(localStorage.getItem('highscore'));
        updateHighscore(lsObj);
    } catch (e) {
        console.warn(e);
    }

    button.addEventListener('click', function(event) {

        overlay.style.display = 'none';
        timerVal.innerHTML = '0:30';
        canvasAnimations.initBubbles.request = startAnimation(
            canvasAnimations.initBubbles.can,
            canvasAnimations.initBubbles.ctx,
            canvasAnimations.initBubbles.objs,
            canvasAnimations.initBubbles.loop
        );

        var counter = 30,
            timer = animationInterval(function() {

                counter--;
                if (counter > 9) {
                    timerVal.innerHTML = '0:' + counter;
                } else {
                    timerVal.innerHTML = '0:0' + counter;
                }

                if (counter === 0) {
                    if( !window.cancelAnimationFrame ) {
                        clearAnimationInterval(timer);
                    }
                    stopAnimation(canvasAnimations.initBubbles.request);

                    overlay.style.display = 'block';
                    input.style.display = 'block';
                    gid('congrats').innerHTML = 'Congratulations!';
                    gid('content').innerHTML = 'Your score is: ' + canvasAnimations.initBubbles.hits.length;

                    button.setAttribute('type', 'restart');
                    button.innerHTML = 'RESTART';

                    return true;
                }
            }, 1000);

        if (button.getAttribute('type') !== 'button') {
            var highscore = [{
                    name: gid('input-val').value,
                    score: canvasAnimations.initBubbles.hits.length
                }],
                lsObj = null;

            if (localStorage.getItem('highscore') !== null) {
                lsObj = localStorage.getItem('highscore');
            }

            if (lsObj === null) {
                localStorage.setItem('highscore', JSON.stringify(highscore));
                updateHighscore(highscore);
            } else {
                var newObj = JSON.parse(lsObj).concat(highscore);
                localStorage.setItem('highscore', JSON.stringify(newObj));
                cleanHighscore();
                updateHighscore(newObj);
            }

            canvasAnimations.initBubbles.hits = [];
            timerVal.innerHTML = '0:30';
            hitcounter.innerHTML = 'score: ' + 0;
        }

    });

};

window.onresize = function() {
    if (gid('bubbles-canvas') !== null) {
        hiDPICanvas('bubbles-canvas', window.innerWidth, window.innerHeight);
    }
};
