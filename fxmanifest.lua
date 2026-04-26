--[[
    fxmanifest.lua (manifesto do recurso FiveM)
    - Declara metadados do recurso (fx_version, game, author, description, version).
    - Define a entrada NUI (ui_page) e lista os ficheiros incluídos no recurso.
    - Especifica scripts do lado cliente a serem carregados (client.lua).
    Este ficheiro é lido pelo servidor FiveM quando o recurso inicia e deve referenciar
    caminhos relativos corretos para os assets (HTML/CSS/JS) usados pela NUI.
]]
---@diagnostic disable: undefined-global
fx_version 'cerulean'
game 'gta5'

author 'Converted by Copilot'
description 'Medical Center Cortez NUI Panel (FiveM)'
version '1.0.0'

ui_page 'html/index.html'

files {
    'html/index.html',
    'html/styles.css',
    'html/script.js'
}

client_script 'client.lua'
