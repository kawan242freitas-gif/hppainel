---@diagnostic disable: undefined-global
--[[
    client.lua (lado cliente)
    - Regista o comando /openpanel e um atalho de teclado (F10) para abrir o painel NUI.
    - Usa SetNuiFocus para ativar entrada do rato/teclado na NUI e SendNUIMessage para avisar
      o HTML a mostrar a interface.
    - Trata callbacks vindos da NUI (RegisterNUICallback), por exemplo 'close' para libertar o foco
      e 'log' para mensagens de depuração.
    - Garante que o foco é libertado se o recurso for parado (onResourceStop).
    Este ficheiro é executado em cada cliente e faz a ponte entre ações no jogo e a interface web.
]]
-- Client side script to toggle NUI for the hospital panel
local nuiOpen = false
local tabletEntity = nil

local function loadAnimDict(dict)
    RequestAnimDict(dict)
    while not HasAnimDictLoaded(dict) do
        Wait(10)
    end
end

local function spawnAndAttachTablet(ped)
    if tabletEntity and DoesEntityExist(tabletEntity) then return end

    local model = joaat('prop_cs_tablet')
    RequestModel(model)
    while not HasModelLoaded(model) do
        Wait(10)
    end

    local coords = GetEntityCoords(ped)
    tabletEntity = CreateObject(model, coords.x, coords.y, coords.z, true, true, false)
    SetModelAsNoLongerNeeded(model)

    local bone = GetPedBoneIndex(ped, 28422) -- right hand
    AttachEntityToEntity(
        tabletEntity,
        ped,
        bone,
        0.03, 0.0, -0.02,      -- pos offset
        10.0, 160.0, 10.0,     -- rot offset
        true, true, false, true, 1, true
    )
end

local function playTabletAnim(ped)
    -- Standing "typing" style (works well with tablet prop attached)
    local dict = 'amb@world_human_stand_mobile@male@text@base'
    local anim = 'base'
    loadAnimDict(dict)
    TaskPlayAnim(ped, dict, anim, 8.0, -8.0, -1, 49, 0.0, false, false, false)
end

local function stopTablet(ped)
    ClearPedSecondaryTask(ped)
    if tabletEntity and DoesEntityExist(tabletEntity) then
        DetachEntity(tabletEntity, true, true)
        DeleteEntity(tabletEntity)
    end
    tabletEntity = nil
end

local function openPanel()
    if nuiOpen then return end
    local ped = PlayerPedId()

    -- Pull out tablet animation/prop first
    spawnAndAttachTablet(ped)
    playTabletAnim(ped)

    SetNuiFocus(true, true)
    SendNUIMessage({ action = 'open' })
    nuiOpen = true
end

local function closePanel()
    if not nuiOpen then return end
    local ped = PlayerPedId()
    SetNuiFocus(false, false)
    SendNUIMessage({ action = 'close' })
    nuiOpen = false
    stopTablet(ped)
end

RegisterCommand('openpanel', function()
    openPanel()
end, false)

RegisterKeyMapping('openpanel', 'Abrir painel do hospital', 'keyboard', 'F10')

-- NUI callback to close the UI
RegisterNUICallback('close', function(data, cb)
    closePanel()
    cb('ok')
end)

-- Example of receiving events from NUI (expand as needed)
RegisterNUICallback('log', function(data, cb)
    print('NUI log:', data and data.msg or 'no-msg')
    cb('ok')
end)

-- Ensure focus is released if resource stops
AddEventHandler('onResourceStop', function(resourceName)
    if resourceName == GetCurrentResourceName() and nuiOpen then
        closePanel()
    end
end)
