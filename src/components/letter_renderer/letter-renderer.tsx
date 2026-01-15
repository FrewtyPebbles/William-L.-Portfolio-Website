"use client";

import { useRef, useEffect, useState, CSSProperties, ReactNode } from "react";
import { GLSurface2D, GraphicsManager, WebGLUniformType } from "../graphics/gl-surface";
import { usePrefersDark } from "@/lib/utils";

interface LetterRendererProps {
  text: string;
  size?: number;
  style?: CSSProperties;
  canvas_height_multiplier:number;
  className?:string;
  children?: ReactNode;
}




export default function LetterRenderer({ text, size = 48, style, canvas_height_multiplier, className, children }: LetterRendererProps) {
  const width = size * text.length;
  const height = size;
  const canvas_height = size * canvas_height_multiplier;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gmRef = useRef<GraphicsManager>(null);
  const hoveredRef = useRef<boolean>(false);
  const [texture, setTexture] = useState<WebGLTexture|null>(null);
  const [perlinNoise, setPerlinNoise] = useState<WebGLTexture|null>(null);
  const [texturedNoise, setTexturedNoise] = useState<WebGLTexture|null>(null);
  const mouseNormalizedPosRef = useRef<{x:number, y:number} | null>(null);
  const modeRef = useRef<number>(0.0);
  const modeIntervalRef = useRef<NodeJS.Timeout>(null);
  const modeToggleRef = useRef<boolean>(true);
  

    function handleMouseMove(e: MouseEvent) {
    
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Get the canvas position and size on the page
        const rect = canvas.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        mouseNormalizedPosRef.current = {
            x:x / rect.right,
            y:y / rect.bottom
        };
        
    }

    function handleClick(event: MouseEvent) {
      clearInterval(modeIntervalRef.current!)
      if (modeToggleRef.current) {
        modeIntervalRef.current = setInterval(() => {
          modeRef.current = Math.min(Math.max(0.0, modeRef.current + 0.001), 1.0)

          if (modeRef.current >= 1) {
            clearInterval(modeIntervalRef.current!)
          }
        }, 10);
      } else {
        modeIntervalRef.current = setInterval(() => {
          modeRef.current = Math.min(Math.max(0.0, modeRef.current - 0.001), 1.0)

          if (modeRef.current <= 0) {
            clearInterval(modeIntervalRef.current!)
          }
        }, 10);
      }
      modeToggleRef.current = !modeToggleRef.current
    }

    const vsSource = `#version 300 es
      in vec2 a_position;
      in vec2 a_texcoord;
      out vec2 v_texcoord;

      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texcoord = a_texcoord;
      }
    `;

    const fsSource = `#version 300 es
      precision mediump float;
      uniform sampler2D u_texture;
      uniform sampler2D perlin_noise;
      uniform sampler2D textured_noise;
      uniform float u_time;
      uniform vec2 mousexy;
      uniform bool hovering;
      uniform float mode;
      in vec2 v_texcoord;
      out vec4 fragColor;

      vec2 tex_noise_distort() {
        vec4 color_left = vec4(0.0);
        vec4 color_right = vec4(0.0);
        vec4 color = vec4(0.0);

        float smudge = clamp(mix(
          0.0,
          distance(mousexy, v_texcoord) - 0.1,
          distance(mousexy, v_texcoord)
        ), 0.0, 1.0);

        
        return mix(mix(
          v_texcoord,
          vec2(
            texture(textured_noise, v_texcoord.xy).x,
            texture(textured_noise, v_texcoord.yx).x
          ) * 1.25,
          smudge
        ), v_texcoord, distance(mousexy, v_texcoord));
      }

      vec2 per_noise_distort() {
        float smudge = clamp(mix(
          0.0,
          distance(mousexy, v_texcoord) - 0.1,
          distance(mousexy, v_texcoord)
        ), 0.0, 0.05);

        return mix(mix(
          v_texcoord,
          vec2(
            texture(perlin_noise, v_texcoord.xy).x,
            texture(perlin_noise, v_texcoord.yx).x
          ) * 1.25,
          smudge
        ), v_texcoord, distance(mousexy, v_texcoord));
      }

      void main() {
        vec4 color_left = vec4(0.0);
        vec4 color_right = vec4(0.0);
        vec4 color = vec4(0.0);

        vec2 distorted_uv_per_noise = per_noise_distort();

        vec2 distorted_uv_tex_noise = tex_noise_distort();
        
        vec2 distorted_uv = mix(
          distorted_uv_per_noise,
          distorted_uv_tex_noise,
          mode
        );

        color = texture(
          u_texture,
          distorted_uv
        );

        vec4 tex_left = texture(
          u_texture,
          distorted_uv + vec2(0.003 * cos(u_time), 0.003 * sin(u_time))
        );

        color_left.ba = color.a == 0.0 && tex_left.a != 0.0 ? vec2(1.0, 1.0) : vec2(0.0);

        vec4 tex_right = texture(
          u_texture,
          distorted_uv - vec2(0.003 * cos(u_time), 0.003 * sin(u_time))
        );

        color_right.ra = color.a == 0.0 && tex_right.a != 0.0 ? vec2(1.0, 1.0) : vec2(0.0);

        vec4 result = color + color_left + color_right;

        fragColor = result;
      }
    `;


    useEffect(() => {
      const gm = gmRef.current;
      if (!gm) return;

      const textCanvas = document.createElement("canvas");
      const dpi = window.devicePixelRatio || 1;

      // Set CSS size
      textCanvas.style.width = `${window.innerWidth}px`;
      textCanvas.style.height = `${window.innerHeight}px`;
      textCanvas.width = width * dpi;
      textCanvas.height = canvas_height * dpi;
      const ctx = textCanvas.getContext("2d")!;
      ctx.clearRect(0, 0, width * dpi, canvas_height * dpi);
      ctx.fillStyle = usePrefersDark(window) ? "white" : "black";
      ctx.font = `${size * dpi}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, width * dpi / 2, canvas_height * dpi / 2);
      let texture_parameters:{[parameter_name:number]:number} = {}
      texture_parameters[gm.gl.TEXTURE_MIN_FILTER] = gm.gl.LINEAR;
      texture_parameters[gm.gl.TEXTURE_MAG_FILTER] = gm.gl.LINEAR;
      texture_parameters[gm.gl.TEXTURE_WRAP_S] = gm.gl.CLAMP_TO_EDGE;
      texture_parameters[gm.gl.TEXTURE_WRAP_T] = gm.gl.CLAMP_TO_EDGE;
      setTexture(gm.create_texture(textCanvas, texture_parameters, 0))

      // textured noise
      const image = new Image();
      image.src = "/textured_noise1.jpg";

      setTexturedNoise(gm.create_texture(image, texture_parameters, 0));
      
      image.onload = () => {
        setTexturedNoise(gm.create_texture(image, texture_parameters, 0));
      }

      // perlin noise
      const image2 = new Image();
      image2.src = "/perlin_noise.jpg";

      setPerlinNoise(gm.create_texture(image2, texture_parameters, 0));
      
      image2.onload = () => {
        setPerlinNoise(gm.create_texture(image2, texture_parameters, 0));
      }

      const canvas = canvasRef.current;
      if (!canvas) return;

      // Set CSS size
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      // Set internal canvas size to match device pixels
      canvas.width = window.innerWidth * dpi;
      canvas.height = window.innerHeight * dpi;

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("click", handleClick, { passive: false });

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("click", handleClick);
      };
    }, [gmRef]);

    

    let time = 0;

  return (
    <GLSurface2D
      ref={canvasRef}
      gmRef={gmRef}
      vertex_shader={vsSource}
      fragment_shader={fsSource}
      style={style}
      className={className}
      onMouseEnter={() => {
        if (gmRef.current)
          gmRef.current.set_uniform("hovering", true);
        hoveredRef.current = true;
      }}
      onMouseLeave={() => {
        if (gmRef.current)
          gmRef.current.set_uniform("hovering", false);
        hoveredRef.current = false;
      }}
      a_position_data={new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
      ])}
      a_texcoord_data={new Float32Array([
        0, 1,   // bottom-left
        1, 1,   // bottom-right
        0, 0,   // top-left
        0, 0,   // top-left
        1, 1,   // bottom-right
        1, 0,   // top-right
    ])}
      uniforms={{
        "u_texture":WebGLUniformType.TEXTURE_2D,
        "perlin_noise":WebGLUniformType.TEXTURE_2D,
        "textured_noise":WebGLUniformType.TEXTURE_2D,
        "u_time":WebGLUniformType.F,
        "mousexy":WebGLUniformType.F2V,
        "hovering":WebGLUniformType.I,
        "mode":WebGLUniformType.F
      }}

      before_render_loop_callback={(gm) => {
        gm.set_uniform("u_texture", texture);
        gm.set_uniform("perlin_noise", perlinNoise);
        gm.set_uniform("textured_noise", texturedNoise);
      }}

      render_loop_callback={(gm) => {
        time += 0.05;
        
        gm.set_uniform("u_time", time);
        let mousexy = mouseNormalizedPosRef.current !== null ? [mouseNormalizedPosRef.current.x, mouseNormalizedPosRef.current.y] : [0.0, 0.0]
        gm.set_uniform("mousexy", mousexy);
        gm.set_uniform("mode", modeRef.current);
      }}
    >{children}</GLSurface2D>
  );
}
