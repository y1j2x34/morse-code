import { ConfigurationTarget, WorkspaceConfiguration } from 'vscode';

export const ConfigurationKeys = [
    'enabled',
    'speed'
] as const;

type ConfigurationKeys = typeof ConfigurationKeys[number];

export interface MorseCodeConfig {
    enabled?: boolean;
    speed?: string | number;
}

export function getConfigValue<V>(key: ConfigurationKeys, vscodeConfig: WorkspaceConfiguration, extensionConfig: MorseCodeConfig) {

    if(isConfigSet(key, vscodeConfig)) {
        return vscodeConfig.get<V>(key);
    }

    const exValue = extensionConfig[key];

    if(!isNullOrUndefined(exValue)) {
        return exValue;
    }

    return vscodeConfig.get<V>(key);
}

export function updateConfig<V>(key: ConfigurationKeys, value: V, config: WorkspaceConfiguration) {
    const target = isConfigSet(key, config) || ConfigurationTarget.Global;
    config.update(key, target);
}

export function isConfigSet(key: ConfigurationKeys, config: WorkspaceConfiguration): ConfigurationTarget | false {
    const inspectionResults = config.inspect(key);
    if(!inspectionResults) {
        return false;
    }
    if (!isNullOrUndefined(inspectionResults.workspaceFolderValue)) {
        return ConfigurationTarget.WorkspaceFolder;
    } else if (!isNullOrUndefined(inspectionResults.workspaceValue)) {
        return ConfigurationTarget.Workspace;
    } else if (!isNullOrUndefined(inspectionResults.globalValue)) {
        return ConfigurationTarget.Global;
    } else {
        return false;
    }
}

function isNullOrUndefined(value: any) {
    return value === null || value === undefined;
}