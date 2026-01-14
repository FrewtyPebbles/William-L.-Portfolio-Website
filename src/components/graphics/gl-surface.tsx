"use client"
import React, { CSSProperties, MouseEventHandler, ReactNode, RefObject } from 'react';

import { useRef, useEffect, useState } from "react";

// passthrough
const DEFAULT_VERTEX = `
    attribute vec2 a_position;
    attribute vec2 a_texcoord;
    varying vec2 v_texcoord;

    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texcoord = a_texcoord;
    }
`;

const DEFAULT_FRAGMENT = `
    precision mediump float;
    uniform sampler2D u_texture;
    varying vec2 v_texcoord;

    void main() {
        vec4 color = texture2D(u_texture, v_texcoord);
        gl_FragColor = color;
    }
`;

type WebGLShaderType = number;
type WebGLType = number;

interface WebGLVertexAttribute {
    label:string;
    attribute_type:WebGLType;
    size:number;
    normalized:boolean;
    dynamic:boolean;
    vertex_buffer:WebGLBuffer;
};

export enum WebGLUniformType {
    TEXTURE_2D,
    F,
    I,
    F2V,
    I2V,
    F3V,
    I3V,
    F4V,
    I4V,
}

interface WebGLUniform {
    label:string;
    loc:WebGLUniformLocation|null;
    type:WebGLUniformType;
    texture_unit?:number;
};

export class GraphicsManager {
    canvas:HTMLCanvasElement;
    gl:WebGLRenderingContext;
    shaders:Array<WebGLShader>;
    shader_program:WebGLProgram|null;
    vertex_attributes:{[key:string]:WebGLVertexAttribute};
    uniforms:{[key:string]:WebGLUniform};
    texture_counter:number = 0;
    vertex_count:number = 0;

    constructor(canvas:HTMLCanvasElement) {
        this.canvas = canvas;
        this.gl = canvas.getContext("webgl2")! as WebGL2RenderingContext;
        this.shaders = [];
        this.shader_program = null;
        this.vertex_attributes = {};
        this.uniforms = {};
    }

    webgl_enabled():boolean {
        return this.gl !== null;
    }

    addShader(type: WebGLShaderType, source: string) {
        const shader = this.gl.createShader(type)!;
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error(this.gl.getShaderInfoLog(shader));
        }
        this.shaders.push(shader);
    }

    create_shader_program() {
        this.shader_program = this.gl.createProgram()!;
        
        for (let shader of this.shaders) {
            this.gl.attachShader(this.shader_program, shader);
        }
        
        this.gl.linkProgram(this.shader_program);
        if (!this.gl.getProgramParameter(this.shader_program, this.gl.LINK_STATUS)) {
            console.error(this.gl.getProgramInfoLog(this.shader_program));
        }
        this.gl.useProgram(this.shader_program);

        // find uniform locs

        for (let [label, uniform] of Object.entries(this.uniforms)) {
            uniform.loc = this.gl.getUniformLocation(this.shader_program!, label);
        }
        
    }

    add_vertex_attribute(label:string, attribute_type:WebGLType, size:number, initial_data:Float32Array, normalized:boolean = false, dynamic:boolean = false) {
        
        let vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, initial_data, dynamic ? this.gl.DYNAMIC_DRAW : this.gl.STATIC_DRAW);
        const texcoordLoc = this.gl.getAttribLocation(this.shader_program!, label);
        this.gl.enableVertexAttribArray(texcoordLoc);
        this.gl.vertexAttribPointer(texcoordLoc, size, attribute_type, normalized, 0, 0);

        this.vertex_attributes[label] = {
            label,
            attribute_type,
            size,
            normalized,
            dynamic,
            vertex_buffer:vertexBuffer
        };
        this.vertex_count = initial_data.length / this.vertex_attributes[label].size;
    }

    set_vertex_attribute_data(label:string, data:Float32Array, offset:number = 0) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertex_attributes[label].vertex_buffer);
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, offset, data);
        this.vertex_count = data.length / this.vertex_attributes[label].size;
    }

    add_uniform(label:string, uniform_type:WebGLUniformType) {
        this.uniforms[label] = {
            label,
            loc:null,
            type:uniform_type
        }
        if (uniform_type == WebGLUniformType.TEXTURE_2D) {
            this.uniforms[label].texture_unit = this.texture_counter;
            this.texture_counter += 1;
        }
    }

    set_uniform(label:string, value:any) {
        if (this.shader_program === null)
            return;
        let uniform = this.uniforms[label];
        if (uniform.loc === null) {
            uniform.loc = this.gl.getUniformLocation(this.shader_program!, label);
        }
        switch (uniform.type) {
            case WebGLUniformType.TEXTURE_2D:
                this.gl.activeTexture(this.gl.TEXTURE0 + uniform.texture_unit!);
                this.gl.bindTexture(this.gl.TEXTURE_2D, value);
                this.gl.uniform1i(uniform.loc!, uniform.texture_unit!);
                break;

            case WebGLUniformType.F:
                this.gl.uniform1f(uniform.loc!, value);
                break;

            case WebGLUniformType.I:
                this.gl.uniform1i(uniform.loc!, value);
                break;

            case WebGLUniformType.F2V:
                this.gl.uniform2fv(uniform.loc!, value);
                break;

            case WebGLUniformType.I2V:
                this.gl.uniform2iv(uniform.loc!, value);
                break;

            case WebGLUniformType.F3V:
                this.gl.uniform3fv(uniform.loc!, value);
                break;

            case WebGLUniformType.I3V:
                this.gl.uniform3iv(uniform.loc!, value);
                break;
        
            default:
                break;
        }
    }

    render(callback:(gm:GraphicsManager)=>void):number {
        callback(this);
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertex_count);
        return requestAnimationFrame(()=>{return this.render(callback);});
    }

    create_texture(image:TexImageSource, texture_parameters:{[parameter_name:number]:number}, mip_level:number, image_type:number = this.gl.UNSIGNED_BYTE):WebGLTexture {
        let texture = this.gl.createTexture();
        if (!texture) throw new Error("Failed to create texture");
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texImage2D(
            this.gl.TEXTURE_2D,   // target
            mip_level,               // mip level
            this.gl.RGBA,         // internal format
            this.gl.RGBA,         // source format
            this.gl.UNSIGNED_BYTE,// source type
            image              // image element
        );
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        for (let [parameter_name_string, parameter_value] of Object.entries(texture_parameters)) {
            let parameter_name = Number(parameter_name_string);
            this.gl.texParameteri(this.gl.TEXTURE_2D, parameter_name, parameter_value);
        }
        return texture;
    }
}

export function GLSurface2D({
    gmRef,
    ref,
    vertex_shader = DEFAULT_VERTEX,
    fragment_shader = DEFAULT_FRAGMENT,
    width,
    height,
    a_position_data,
    a_texcoord_data,
    uniforms,
    render_loop_callback,
    before_render_loop_callback,
    style,
    className,
    onMouseEnter,
    onMouseLeave,
    onMouseMove,
    children,
    onClick,
    onScroll
}:{
    gmRef:RefObject<GraphicsManager | null>,
    ref:RefObject<HTMLCanvasElement | null>,
    vertex_shader?:string,
    fragment_shader?:string,
    width?:number,
    height?:number,
    a_position_data:Float32Array,
    a_texcoord_data:Float32Array,
    uniforms:{[label:string]:WebGLUniformType},
    render_loop_callback:(gm:GraphicsManager) => void,
    before_render_loop_callback:(gm:GraphicsManager) => void,
    style?: CSSProperties,
    className?: string,
    onMouseEnter?: MouseEventHandler<HTMLCanvasElement>,
    onMouseLeave?: MouseEventHandler<HTMLCanvasElement>,
    onMouseMove?: MouseEventHandler<HTMLCanvasElement>,
    onClick?: MouseEventHandler<HTMLCanvasElement>,
    onScroll?: (event:React.WheelEvent<HTMLCanvasElement>) => void,
    children?: ReactNode,
}) {

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;

        // Graphics Manager
        const gm = new GraphicsManager(canvas);
        if (!gm.webgl_enabled()) return;

        gmRef.current = gm;

        for (let [label, u_type] of Object.entries(uniforms)) {
            gm.add_uniform(label, u_type)
        }

        gm.addShader(gm.gl.VERTEX_SHADER, vertex_shader);
        gm.addShader(gm.gl.FRAGMENT_SHADER, fragment_shader);

        gm.create_shader_program();

        // add vertex position and texcoord
        gm.add_vertex_attribute("a_position", gm.gl.FLOAT, 2, a_position_data);
        gm.add_vertex_attribute("a_texcoord", gm.gl.FLOAT, 2, a_texcoord_data);

        // render loop

        before_render_loop_callback(gm);

        let animationFrameID = gm.render(render_loop_callback);

        return () => cancelAnimationFrame(animationFrameID);
    }, [width, height, a_position_data, a_texcoord_data, uniforms]);

    return (
        <canvas
        ref={ref}
        width={width}
        height={height}
        style={style}
        className={className}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onMouseMove={onMouseMove}
        onClick={onClick}
        onScroll={onScroll}
        >{children}</canvas>
    );
}
