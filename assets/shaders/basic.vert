// This vertex shader is used when there's nothing else to do with this.

attribute vec3 aPosition;
attribute vec2 aTexCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec2 curTexCoord;

void main(void){
    gl_Position = uProjectionMatrix*uModelViewMatrix*vec4(aPosition, 1);
    curTexCoord = aTexCoord;
}
