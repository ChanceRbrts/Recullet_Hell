precision highp float;

uniform sampler2D uSampler;
uniform bool isHit;
uniform vec4 rCharge;

varying vec2 curTexCoord;

void main(void){
    float tCX = curTexCoord.x;
    float tCY = curTexCoord.y;
    vec4 startColor = texture2D(uSampler, curTexCoord);
    vec4 alteredColor = vec4(startColor.b, startColor.g, startColor.r, startColor.a);
    float regionOne = rCharge.x*float(tCY < 0.5 && tCY < min(tCX, 1.0-tCX));
    float regionTwo = rCharge.w*float(tCX > 0.5 && 1.0-tCX < min(tCY, 1.0-tCY));
    float regionThree = rCharge.z*float(tCY > 0.5 && 1.0-tCY < min(tCX, 1.0-tCX));
    float regionFour = rCharge.y*float(tCX < 0.5 && tCX < min(tCY, 1.0-tCY));
    float regionCharge = regionOne+regionTwo+regionThree+regionFour;
    vec4 color = startColor*(1.0-regionCharge)+alteredColor*regionCharge;
    vec4 hitColor = vec4(vec3(color.rgb+(100.0/255.0)), color.a);
    if (color.a < 0.1) discard;
    gl_FragColor = color*float(!isHit)+hitColor*float(isHit);
}