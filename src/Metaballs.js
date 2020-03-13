//~---------------------------------------------------------------------------//
//                        _      _                 _   _                      //
//                    ___| |_ __| |_ __ ___   __ _| |_| |_                    //
//                   / __| __/ _` | '_ ` _ \ / _` | __| __|                   //
//                   \__ \ || (_| | | | | | | (_| | |_| |_                    //
//                   |___/\__\__,_|_| |_| |_|\__,_|\__|\__|                   //
//                                                                            //
//  File      : Metaballs.js                                                  //
//  Project   : stdmatt-demos                                                 //
//  Date      : 18 Jul, 2019                                                  //
//  License   : GPLv3                                                         //
//  Author    : stdmatt <stdmatt@pixelwizards.io>                             //
//  Copyright : stdmatt - 2019                                                //
//                                                                            //
//  Description :                                                             //
//                                                                            //
//---------------------------------------------------------------------------~//


//----------------------------------------------------------------------------//
// Constants                                                                  //
//----------------------------------------------------------------------------//
const BALLS_MAX_RADIUS = 50;
const BALLS_MIN_RADIUS = 10;
const MAX_BALLS        = 20;
const MIN_BALLS        =  2;

const PROJECT_TITLE        = "<b>Title:</b>Metaballs<br>";
const PROJECT_DATE         = "<b>Date:</b>Jul 18, 2019<br>";
const PROJECT_VERSION      = "<b>Version:</b> " + GetVersion() + "<br>";
const PROJECT_INSTRUCTIONS = "<br>Move the mouse to control one of the metaballs<br>";
const PROJECT_LINK         = "<a href=\"http://stdmatt.com/demos/metaballs.html\">More info</a>";


//----------------------------------------------------------------------------//
// Variables                                                                  //
//----------------------------------------------------------------------------//
let balls_x     = [];
let balls_y     = [];
let balls_r     = [];
let balls_vel_x = [];
let balls_vel_y = [];
let balls_length = 0;
var total_time   = 0;


//----------------------------------------------------------------------------//
// Helper Functions                                                           //
//----------------------------------------------------------------------------//
//------------------------------------------------------------------------------
function hslToRgb(h, s, l)
{
    var r, g, b;

    if (s == 0) {
      r = g = b = l; // achromatic
    } else {
      function hue2rgb(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      }

      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;

      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return [ r * 255, g * 255, b * 255,  255];
}

//------------------------------------------------------------------------------
function CreateBall()
{
    if(balls_length >= MAX_BALLS) {
        return;
    }

    balls_x    .push(Random_Int(Canvas_Edge_Left,    Canvas_Edge_Right));
    balls_y    .push(Random_Int(Canvas_Edge_Bottom,  Canvas_Edge_Top  ));
    balls_r    .push(Random_Int(BALLS_MIN_RADIUS,    BALLS_MAX_RADIUS ));
    balls_vel_x.push(Random_Int(-5,                  +5               ));
    balls_vel_y.push(Random_Int(-5,                  +5               ));

    ++balls_length;
}

//------------------------------------------------------------------------------
function UpdateBall(i, dt)
{
    x     = balls_x    [i];
    y     = balls_y    [i];
    r     = balls_r    [i];
    vel_x = balls_vel_x[i];
    vel_y = balls_vel_y[i];

    //
    // Physics.
    balls_x[i] += (vel_x * dt * 10);
    balls_y[i] += (vel_y * dt * 10);

    //
    // Wrap the balls.
    if(balls_x[i] + r < Canvas_Edge_Left ||
       balls_x[i] - r > Canvas_Edge_Right)
    {
        balls_vel_x[i] *= -1;
    }

    if(balls_y[i] + r < Canvas_Edge_Top ||
       balls_y[i] - r > Canvas_Edge_Bottom)
    {
        balls_vel_y[i] *= -1;
    }
}


//----------------------------------------------------------------------------//
// Setup / Draw                                                               //
//----------------------------------------------------------------------------//
//------------------------------------------------------------------------------
function Setup()
{
    //
    // Configure the Canvas.
    const parent        = document.getElementById("canvas_div");
    const parent_width  = parent.clientWidth;
    const parent_height = parent.clientHeight;

    const max_side = Math_Max(parent_width, parent_height);
    const min_side = Math_Min(parent_width, parent_height);

    const ratio = min_side / max_side;

    // Landscape
    if(parent_width > parent_height) {
        Canvas_CreateCanvas(800, 800 * ratio, parent);
    }
    // Portrait
    else {
        Canvas_CreateCanvas(800 * ratio, 800, parent);
    }

    Canvas.style.width  = "100%";
    Canvas.style.height = "100%";


    //
    // Add information.
    const info = document.createElement("p");
    info.innerHTML = String_Cat(
        PROJECT_TITLE,
        PROJECT_DATE,
        PROJECT_VERSION,
        PROJECT_INSTRUCTIONS,
        PROJECT_LINK,
    )
    parent.appendChild(info);

    //
    // Start the Demo...
    Random_Seed(1); // @todo(stdmatt): Add random seed.
    Input_InstallBasicMouseHandler(Canvas);

    for(let i = 0; i < Random_Int(MIN_BALLS, MAX_BALLS); ++i) {
        CreateBall();
    }

    max_dist = Math_Distance(
        Canvas_Half_Width, Canvas_Half_Height,
        Canvas_Edge_Left,  Canvas_Edge_Top
    );

    Canvas_Draw(0);
}


//------------------------------------------------------------------------------
function Draw(dt)
{
    total_time += dt;

    Canvas_LockPixels();
    for(let y = 0; y < Canvas_Height; ++y) {
        for(let x = 0; x < Canvas_Width; ++x) {
            let sum = 0;

            for(let b = 0; b < balls_length; ++b) {
                var ball_x = (Canvas_Half_Width  + balls_x[b]);
                var ball_y = (Canvas_Half_Height + balls_y[b]);
                var ball_r = balls_r[b];

                let dist  = Math_Distance(x, y, ball_x, ball_y);
                let value = (ball_r * 1100 / dist);
                sum += value;
            }

            var final = sum;
            if(final > 360) {
                final %= 360;
            }

            let color = hslToRgb(final / 360.0, 1.0, 0.5);
            Canvas_SetColor(x,y, color);
        }
    }
    Canvas_UnlockPixels();

    for(let i = 0; i < balls_length; ++i) {
        UpdateBall(i, dt);

        balls_x[0] = Mouse_X - Canvas_Half_Width;
        balls_y[0] = Mouse_Y - Canvas_Half_Height;
    }
}


//----------------------------------------------------------------------------//
// Entry Point                                                                //
//----------------------------------------------------------------------------//
// Canvas_Setup(;
Setup()
