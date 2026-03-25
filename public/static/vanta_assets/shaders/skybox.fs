#version 300 es
precision lowp float;

in vec3 v_texCoord;

out vec4 fragColor;

uniform samplerCube skybox_texture;

uniform bool is_dark_mode;

void main() {
    fragColor = texture(skybox_texture, v_texCoord);
    if (is_dark_mode) {
        fragColor.rgb = 1.0 - fragColor.rgb;
    }
}
