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

RegisterCommand('openpanel', function()
    SetNuiFocus(true, true)
    SendNUIMessage({ action = 'open' })
    nuiOpen = true
end, false)

RegisterKeyMapping('openpanel', 'Abrir painel do hospital', 'keyboard', 'F10')

-- NUI callback to close the UI
RegisterNUICallback('close', function(data, cb)
    SetNuiFocus(false, false)
    nuiOpen = false
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
        SetNuiFocus(false, false)
    end
end)
