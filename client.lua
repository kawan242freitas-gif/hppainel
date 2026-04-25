---@diagnostic disable: undefined-global
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
