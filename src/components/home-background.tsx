"use client"
import { Vec3 } from '@vicimpa/glm';
import { useRef, useLayoutEffect } from 'react';
import Engine, { ArrayMember, AssetFile, Camera3D, CubeMapTexture, DirectionalLight, GraphicsManager, Node, Node3D, Object3D, PointLight, Skybox, Texture, TextureType, WebGLUniformType } from "vanta-engine";

interface Props {
    className?:string
}

const HomeBackground = ({className}:Props) => {
    const canvas_ref = useRef<HTMLCanvasElement>(null);
    const engine_ref = useRef<Engine>(null);

    useLayoutEffect(() => {

        // MEDIA QUERY FOR SKYBOX
        const match_media = window.matchMedia('(prefers-color-scheme: dark)');

        const mq_cb = (event:MediaQueryListEvent, gm:GraphicsManager) => {
            const color_scheme = event.matches ? "dark" : "light";
            gm.use_shader("skybox_shader", true)
            gm.write_uniform("is_dark_mode", color_scheme == "dark", false, true);
            gm.clear_shader()
            gm.use_shader("name_shader", true)
            gm.write_uniform("is_dark_mode", color_scheme == "dark", false, true);
            gm.clear_shader()
            console.log(color_scheme);
        }

        // ENGINE STARTUP FUNCTION
        async function startup(engine:Engine) {
            const gm:GraphicsManager = engine.graphics_manager;

            if (!engine.main_scene)
                throw Error("Main scene not set.");

            if (!gm.webgl_enabled()) {
                throw new Error("WebGL2 is not enabled!");
            }

            const name_asset_promise = AssetFile.OBJ.load_obj(engine, "/static/vanta_assets/models/name/source/name.obj", "/static/vanta_assets/models/name/textures/")

            // NAME SHADER

            const name_shader_prog = gm.create_shader_program("name_shader");

            name_shader_prog.add_shader(gm.gl.VERTEX_SHADER, await engine.UTIL.load_text_file("/static/vanta_assets/shaders/name.vs"));
            name_shader_prog.add_shader(gm.gl.FRAGMENT_SHADER, await engine.UTIL.load_text_file("/static/vanta_assets/shaders/name.fs"));
            
            // binary mask
            name_shader_prog.add_uniform("mask", WebGLUniformType.TEXTURE_2D);

            // utility
            name_shader_prog.add_uniform("time", WebGLUniformType.F);
            name_shader_prog.add_uniform("canvas_height", WebGLUniformType.F);
            name_shader_prog.add_uniform("canvas_width", WebGLUniformType.F);
            name_shader_prog.add_uniform("is_dark_mode", WebGLUniformType.B);

            // SHADOWS
            name_shader_prog.add_uniform("depth_cubemap", WebGLUniformType.TEXTURE_CUBE_MAP);

            // MVP
            name_shader_prog.add_uniform("u_model", WebGLUniformType.F4M);
            name_shader_prog.add_uniform("u_view", WebGLUniformType.F4M);
            name_shader_prog.add_uniform("u_projection", WebGLUniformType.F4M);

            // GLOBAL STUFF
            name_shader_prog.add_ubo("u_global", {
                directional_lights_count: WebGLUniformType.I,
                point_lights_count: WebGLUniformType.I,
                spot_lights_count: WebGLUniformType.I,
                point_lights: new ArrayMember({
                    position: WebGLUniformType.F3V,
                    color: WebGLUniformType.F3V,
                    range: WebGLUniformType.F,
                    energy: WebGLUniformType.F,
                    
                    ambient: WebGLUniformType.F,
                    diffuse: WebGLUniformType.F,
                    specular: WebGLUniformType.F,
                }, 10),
                spot_lights: new ArrayMember({
                    position: WebGLUniformType.F3V,
                    color: WebGLUniformType.F3V,
                    rotation: WebGLUniformType.F4M,
                    energy: WebGLUniformType.F,
                    range: WebGLUniformType.F,
                    cookie_radius: WebGLUniformType.F,
                    
                    ambient: WebGLUniformType.F,
                    diffuse: WebGLUniformType.F,
                    specular: WebGLUniformType.F,
                }, 10),
                directional_lights: new ArrayMember({
                    rotation: WebGLUniformType.F4M,
                    color: WebGLUniformType.F3V,
                    energy: WebGLUniformType.F,
                    
                    ambient: WebGLUniformType.F,
                    diffuse: WebGLUniformType.F,
                    specular: WebGLUniformType.F,
                }, 10),
                environment: {
                    ambient_light: WebGLUniformType.F3V,
                },
                shadow_map_size: WebGLUniformType.F2V,
                u_directional_light_space_matrix: new ArrayMember(WebGLUniformType.F4M, 10),
                u_point_light_space_matrix: new ArrayMember(WebGLUniformType.F4M, 60),
                camera_position: WebGLUniformType.F3V
            });

            name_shader_prog.add_ubo("u_object", {
                material: {
                    has_normal_texture: WebGLUniformType.B,
                    has_albedo_texture: WebGLUniformType.B,
                    albedo: WebGLUniformType.F3V,
                    has_metalic_texture: WebGLUniformType.B,
                    metalic: WebGLUniformType.F,
                    has_roughness_texture: WebGLUniformType.B,
                    roughness: WebGLUniformType.F,
                    has_ao_texture: WebGLUniformType.B,
                    ao: WebGLUniformType.F,
                }
            });

            // Material Textures
            name_shader_prog.add_uniform("material_texture_albedo", WebGLUniformType.TEXTURE_2D);
            name_shader_prog.add_uniform("material_texture_normal", WebGLUniformType.TEXTURE_2D);
            name_shader_prog.add_uniform("material_texture_metalic", WebGLUniformType.TEXTURE_2D);
            name_shader_prog.add_uniform("material_texture_roughness", WebGLUniformType.TEXTURE_2D);
            name_shader_prog.add_uniform("material_texture_ao", WebGLUniformType.TEXTURE_2D);

            // shadows
            name_shader_prog.add_uniform("directional_light_shadow_maps", WebGLUniformType.SHADOW_2D_ARRAY);
            name_shader_prog.add_uniform("point_light_shadow_maps", WebGLUniformType.SHADOW_2D_ARRAY);

            name_shader_prog.build()

            // SKYBOX SHADER
            const skybox_shader_prog = gm.create_shader_program("skybox_shader");

            skybox_shader_prog.add_shader(gm.gl.VERTEX_SHADER, await engine.UTIL.load_text_file("/static/vanta_assets/shaders/skybox.vs"));
            skybox_shader_prog.add_shader(gm.gl.FRAGMENT_SHADER, await engine.UTIL.load_text_file("/static/vanta_assets/shaders/skybox.fs"));

            skybox_shader_prog.add_uniform("u_view", WebGLUniformType.F4M);
            skybox_shader_prog.add_uniform("u_projection", WebGLUniformType.F4M);
            skybox_shader_prog.add_uniform("skybox_texture", WebGLUniformType.TEXTURE_CUBE_MAP);
            skybox_shader_prog.add_uniform("is_dark_mode", WebGLUniformType.B);

            skybox_shader_prog.build();

            // Create assets

            const name = (await name_asset_promise) as Node3D;

            await name.set_lua_file("/static/vanta_assets/scripts/name.lua");

            let mask_texture = new Texture(gm, "mask_texture", await engine.UTIL.load_image("/static/vanta_assets/textures/hex_data_texture.png"), TextureType.COLOR, {});
            gm.use_shader("name_shader", true)
            gm.write_uniform("mask", mask_texture, false, true);
            gm.clear_shader()

            const render_cb = (node: Node, engine: Engine, time: number, delta_time: number) => {
                gm.set_uniform("time", time);
                const canv_rect = canvas_ref.current?.getBoundingClientRect();
                if (canv_rect !== undefined) {
                    gm.set_uniform("canvas_width", canv_rect.width);
                    gm.set_uniform("canvas_height", canv_rect.height);
                }
            }

            name.on_update_callback = (node, engine, time, delta_time) => {
                const canv_rect = canvas_ref.current!.getBoundingClientRect();
                
                if (canv_rect !== undefined) {
                    name.scale = new Vec3(90 * canv_rect.width / canv_rect.height);
                }
            }

            if (name instanceof Object3D) {
                name.model.material.blend_function = {sfactor:gm.gl.SRC_ALPHA, dfactor:gm.gl.ONE_MINUS_SRC_ALPHA};
                name.model.material.set_shader_program(name_shader_prog);
                name.on_render_callback = render_cb;
            }

            for (const child of name.children) {
                if (child instanceof Object3D) {
                    child.model.material.blend_function = {sfactor:gm.gl.SRC_ALPHA, dfactor:gm.gl.ONE_MINUS_SRC_ALPHA};
                    child.model.material.set_shader_program(name_shader_prog);
                    child.on_render_callback = render_cb;
                }
                for (const sub_child of child.children) {
                    if (sub_child instanceof Object3D) {
                        sub_child.model.material.blend_function = {sfactor:gm.gl.SRC_ALPHA, dfactor:gm.gl.ONE_MINUS_SRC_ALPHA};
                        sub_child.model.material.set_shader_program(name_shader_prog);
                        child.on_render_callback = render_cb;
                    }
                }
            }

            const space_cubemap = new CubeMapTexture(
                gm, "space_cubemap", 256 * 2, TextureType.COLOR,
                await engine.UTIL.load_image("/static/vanta_assets/skyboxes/space/top.jpg"),
                await engine.UTIL.load_image("/static/vanta_assets/skyboxes/space/bottom.jpg"),
                await engine.UTIL.load_image("/static/vanta_assets/skyboxes/space/front.jpg"),
                await engine.UTIL.load_image("/static/vanta_assets/skyboxes/space/back.jpg"),
                await engine.UTIL.load_image("/static/vanta_assets/skyboxes/space/left.jpg"),
                await engine.UTIL.load_image("/static/vanta_assets/skyboxes/space/right.jpg"),
                {},
                0
            );

            const skybox = new Skybox(engine, "space_skybox", space_cubemap, new Vec3(0,0,0), skybox_shader_prog);

            // SET SKYBOX DARKMODE UNIFORM:
            match_media.addEventListener('change', (ev)=>mq_cb(ev, gm));

            const dark_mode = match_media.matches;
            const color_scheme = dark_mode ? "dark" : "light";
            gm.use_shader("skybox_shader", true)
            gm.write_uniform("is_dark_mode", color_scheme == "dark", false, true);
            gm.clear_shader()
            gm.use_shader("name_shader", true)
            gm.write_uniform("is_dark_mode", color_scheme == "dark", false, true);
            gm.clear_shader()

            // CREATE LIGHTS AND SET ROOT NODE


            const point_light = new PointLight(engine, "point_light", new Vec3(0,1,0), 1.0, 1.0, 1.0, 10.0, 1000.0);
            const point_light_back = new PointLight(engine, "point_light_back", new Vec3(0,0,1), 1.0, 1.0, 1.0, 15.0, 1000.0);
            const directional_light = new DirectionalLight(engine, "sun", new Vec3(1,0,0), 1.0, 1.0, 1.0, 10);
            engine.main_scene.root_node = skybox;

            // Create initial scene

            engine.main_scene.main_camera_3d = new Camera3D(engine, "main_camera");
            
            skybox.push_child(name)
            skybox.push_child(directional_light)
            name.push_child(point_light)
            name.push_child(point_light_back)
            // name.push_child(engine.main_scene.main_camera_3d)
            
            // position assets

            const light_update_cb = (node: Node, engine: Engine, time: number, delta_time: number) => {
                point_light.position = new Vec3(0, Math.sin(time * 0.05 * Math.PI/180), Math.cos(time * 0.05 * Math.PI/180))
            }
            
            point_light.on_update_callback = light_update_cb;
            point_light_back.on_update_callback = light_update_cb;
            
            point_light.position = new Vec3(0, 0.3, 0.5)
            point_light_back.position = new Vec3(0, -0.3, 0.5)
            directional_light.rotation.rotateY(-90 * Math.PI/180)
            directional_light.rotation.rotateZ(30 * Math.PI/180)
            engine.main_scene.main_camera_3d.position = new Vec3(0,0,1).mul(500);
            // engine.main_scene.main_camera_3d.rotation = name.rotation
        }

        // Once canvas is rendered, start the engine.
        engine_ref.current = new Engine(canvas_ref.current!, null, startup);
        engine_ref.current.start();

        return () => {
            if (engine_ref.current)
                engine_ref.current.stop();
            match_media.removeEventListener('change', (ev)=>mq_cb(ev, engine_ref.current?.graphics_manager!));
        }
    }, [canvas_ref, window]);

    return (
        <canvas className={className} ref={canvas_ref}/>
    );
}

export default HomeBackground;
