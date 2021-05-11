precision highp float;

uniform sampler2D uSampler;
uniform bool isHit;
uniform float sX;
uniform float sY;
uniform float xSpan;
uniform float ySpan;

varying vec2 curTexCoord;

void main(void){
    // Shorthand
    vec2 realTexCoord = vec2((curTexCoord.x+sX)/xSpan, (curTexCoord.y+sY)/ySpan);
    vec4 color = texture2D(uSampler, realTexCoord);
    vec4 hitColor = vec4(vec3(color.rgb+(100.0/255.0)), color.a);
    if (color.a < 0.1) discard;
    gl_FragColor = color*float(!isHit)+hitColor*float(isHit);
}
