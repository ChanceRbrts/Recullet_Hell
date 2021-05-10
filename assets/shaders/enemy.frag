precision highp float;

uniform sampler2D uSampler;
uniform bool isHit;

varying vec2 curTexCoord;

void main(void){
    vec4 color = texture2D(uSampler, curTexCoord);
    vec4 hitColor = vec4(vec3(color.rgb+(100.0/255.0)), color.a);
    if (color.a < 0.1) discard;
    gl_FragColor = color*float(!isHit)+hitColor*float(isHit);
}
