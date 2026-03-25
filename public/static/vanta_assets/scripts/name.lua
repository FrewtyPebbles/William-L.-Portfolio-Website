

camera_speed = 150.0
camera_look_speed = 10.0
camera_yaw = 0.0
camera_pitch = 0.0

function on_ready(node, engine)
    
end

function on_removed(node, engine, parent)

end

function wrap(value, min, max)
    if value > max then
        while value > max do
            value = value - max
        end
        value = min + value
    end

    if value < min then
        while value < min do
            value = value - min
        end
        value = max - value
    end

    return value
end

function position_camera(camera, node, delta_time)

    camera.rotation = node.rotation:clone()

    local camera_forward = Vec4(0,0,-1,1):applyQuat(camera.rotation).xyz;
    
    local offset = camera_forward:clone():mul(450)
    camera.position = node.position:clone():sub(offset)
end

function on_update(node, engine, time, delta_time)
    local rotate_speed = 0.01 -- Degrees
    -- engine.main_scene.main_camera_3d.position = node.position:clone():add(Vec3(0,0,1):mul(500))
    node.rotation:rotateX(rotate_speed * delta_time)
    node.rotation:rotateY(rotate_speed * delta_time)
    node.rotation:rotateZ(rotate_speed * delta_time)
    local camera = engine.main_scene.main_camera_3d
    position_camera(camera, node, delta_time)
end

function on_render(node, engine, time, delta_time)
    
end