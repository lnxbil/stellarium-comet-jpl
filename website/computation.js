/* This function parses a JPL/HORIZONS output and generates
 * a Stellarium entry for ssystem.ini.
 *
 * For further information, please refer to
 * http://www.stellarium.org/wiki/index.php/JPL_HORIZONS
 *
 * Written by Andreas Steinel and released under GPL
 * Various Patches by Andrew Hood
 * Various Patches by Bernd Kreuss
 */

function convertTitle(str) {
    var res = str.replace(/[ ]+$/g,'').replace(/ /g,'_').replace('/','').replace('(','').replace(')','').replace('-','');
    return res;
}

function parseText() {
    var result = document.getElementById('result');
    var data   = document.getElementById('inputdata');

    // Reading Target in to 'target'
    var targetReg = /^Target body name: ([-a-zA-Z0-9\/ ()]+)/m;
    targetReg.exec(data.value);
    var target = RegExp.$1;

    // Reading 'Start Time' in to 'startt'
    var starttReg = /^Start time      : (.*)$/m;
    starttReg.exec(data.value);
    var startt = RegExp.$1;

    // Reading 'Stop Time' in to 'stopt'
    var stoptReg = /^Start time      : (.*)$/m;
    stoptReg.exec(data.value);
    var stopt = RegExp.$1;

    // optional: M1 and k1 are used for calculating the total magnitude of comets  
    // Reading M1
    var M1Reg = /M1=[ ]*([0-9.E+\-]+)/m;
    if (M1Reg.exec(data.value)){
        var M1 = parseFloat(RegExp.$1);
    }else{
        var M1 = NaN;
    }
    
    // Reading k1
    var k1Reg = /k1=[ ]*([0-9.E+\-]+)/m;
    if (k1Reg.exec(data.value)){
        var k1 = parseFloat(RegExp.$1);
    }else{
        var k1 = NaN;
    }
        
    // optional: H and G are used for calculating the magnitude of asteroids  
    // Reading H
    var HReg = / H=[ ]*([0-9.E+\-]+)/m;
    if (HReg.exec(data.value)){
        var H = parseFloat(RegExp.$1);
    }else{
        var H = NaN;
    }

    // Reading G
    var GReg = / G=[ ]*([0-9.E+\-]+)/m;
    if (GReg.exec(data.value)){
        var G = parseFloat(RegExp.$1);
    }else{
        var G = NaN;
    }
     
    // optional: Reading radius (RAD)
    var radiusReg = /RAD=[ ]*([0-9.E+\-]+)/m;
    if (radiusReg.exec(data.value)){
        var radius = parseFloat(RegExp.$1);
    }else{
        var radius = 10;
    }
        
    // optional: Reading albedo
    var albedoReg = /ALBEDO=[ ]*([0-9.E+\-]+)/m;
    if (albedoReg.exec(data.value)){
        var albedo = parseFloat(RegExp.$1);
    }else{
        var albedo = 1;
    }

    // Reading the SOE-Part into 'soe' for further processing
    var soeReg    = /\$\$SOE([\s\S]*)\$\$EOE/m;
    soeReg.exec(data.value);
    var soe = RegExp.$1;

    // Reading Epoch - valid for CE dates.
    var epochReg = /^[ ]*([0-9.]+)[ ]*=[ ]*A[.]D[.][ ]*/m;
    epochReg.exec(soe);
    var epoch = RegExp.$1;

    // Reading Eccentricity (EC)
    var ecReg    = /EC=[ ]*([0-9.E+\-]+)/m;
    ecReg.exec(soe);
    var Pec = parseFloat(RegExp.$1);

    // Reading Time of periapsis (Tp)
    var tpReg    = /Tp=[ ]*([0-9.E+\-]+)/m;
    tpReg.exec(soe);
    //var Ptp = parseFloat(RegExp.$1);
    var Ptp = parseFloat(RegExp.$1);

    // Reading Periapsis distance (QR)
    var qrReg    = /QR=[ ]*([0-9.E+\-]+)/m;
    qrReg.exec(soe);
    var Pqr = parseFloat(RegExp.$1);

    // Reading Argument of Perifocus
    var wReg    = /W[ ]*=[ ]*([0-9.E+\-]+)/m;
    wReg.exec(soe);
    var Pw = parseFloat(RegExp.$1);

    // Reading Longitude of Ascending Node
    var omReg    = /OM=[ ]*([0-9.E+\-]+)/m;
    omReg.exec(soe);
    var Pom = parseFloat(RegExp.$1);

    // Reading Inclination w.r.t xy-plane
    var inReg    = /IN=[ ]*([0-9.E+\-]+)/m;
    inReg.exec(soe);
    var Pin = parseFloat(RegExp.$1);
    
    // make stellarium use an alternative magnitude calculation.
    // If H and G are given then it is an asteroid and if M1 and k1
    // are given then it is a comet.
    if (!isNaN(M1) && !isNaN(k1)){
        strHG = "\n# use M1 and k1 for the total magnitude of comets\n" +
                "type                        = comet\n" +
                "absolute_magnitude          = " + M1 + "\n" +
                "slope_parameter             = " + k1 + "\n";
    } else if (!isNaN(H) && !isNaN(G)){
        strHG = "\n# use H and G for the magnitude of asteroids\n" +
                "type                        = asteroid\n" +
                "absolute_magnitude          = " + H + "\n" +
                "slope_parameter             = " + G + "\n";
    } else {
        // if none of these options are given then stellarium will
        // fall back to the default radius and albedo calculation
        strHG = ""
    }

    result.value = "[" + convertTitle(target)  + "]\n"+
                   "# Data taken from JPL/HORIZONS\n" +
                   "# correct for the specified time frame:\n" +
                   "# Start Time : " + startt + "\n" +
                   "# Stop Time  : " + stopt  + "\n" +
                   "name                        = Comet " + target + "\n" +
                   "parent                      = Sun\n" +
                   "coord_func                  = comet_orbit\n" +
                   "radius                      = " + radius + "\n" +
                   "oblateness                  = 0.0\n" +
                   "albedo                      = " + albedo + "\n" +
                   "lighting                    = true\n" +
                   "halo                        = true\n" +
                   "color                       = 1.0,1.0,1.0\n" +
                   "tex_halo                    = star16x16.png\n" +
                   "tex_map                     = nomap.png\n" +
                   "lighting                    = false\n" +
                   "orbit_Epoch                 = " + epoch + "\n" +
                   "orbit_TimeAtPericenter      = " + Ptp + "\n" +
                   "orbit_PericenterDistance    = " + Pqr + "\n" +
                   "orbit_Eccentricity          = " + Pec + "\n" +
                   "orbit_ArgOfPericenter       = " + Pw  + "\n" +
                   "orbit_AscendingNode         = " + Pom + "\n" +
                   "orbit_Inclination           = " + Pin + "\n" +
                   strHG;

    return true;

}


