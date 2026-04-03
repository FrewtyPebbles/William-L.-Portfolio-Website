#version 300 es
precision highp float;
precision lowp sampler2DArrayShadow;

#define N_DIRECTIONAL_LIGHTS 10
#define N_POINT_LIGHTS 10
#define N_SPOT_LIGHTS 10

// Vertex position attribute
layout(location = 0) in vec3 a_position;
layout(location = 1) in vec3 a_normal;
layout(location = 2) in vec2 a_uv;

out vec3 v_normal;
out vec2 v_uv;
out vec4 v_frag_pos;
out vec4 v_clip_pos;

// Uniform MVP matrix
uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

uniform float time;

void main() {

    vec3 position = a_position;

    position.y += cos(time / 1000.0 + position.x * 10.0) / 10.0;

    v_frag_pos = u_model * vec4(position, 1.0);
    v_normal = normalize(mat3(transpose(inverse(u_model))) * a_normal);
    v_uv = a_uv;

    v_clip_pos = u_projection * u_view * v_frag_pos;
    gl_Position = v_clip_pos;
}