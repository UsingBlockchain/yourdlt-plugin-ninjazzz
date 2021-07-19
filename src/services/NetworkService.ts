/**
 * This file is part of YourDLT Wallet Plugins shared under LGPL-3.0
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     YourDLT Wallet Plugins
 * @subpackage  @yourdlt/plugin-ninjazzz
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     LGPL-3.0
 */
import Vue from 'vue';
import { PluginBridge } from '@yourdlt/wallet-api-bridge';
import { Address, RepositoryFactoryHttp, RepositoryFactoryConfig, NetworkCurrencies } from 'symbol-sdk';

/**
 * @class {NetworkService}
 * @description This service class provides methods to handle network
 * connection.
 */
export class NetworkService {
    /// region public API
    /**
     * Construct a booklet service around an optional \a $app
     * Vue component/parent component.
     *
     * @param {Vue} $app
     */
    public constructor(protected readonly $app?: Vue) {}

    /**
     * This method reads the repository factory from the Vuex app store
     * to be able to use the network connection.
     *
     * @async
     * @returns {Promise<RepositoryFactoryHttp>}
     */
    public async getRepositoryFactory(): Promise<RepositoryFactoryHttp> {
        // Uses IPC to get repository factory from app store (Vuex)
        const networkBus = await PluginBridge.StoreActionRequest(
            '@yourdlt/plugin-ninjazzz',
            'getter',
            'network/repositoryFactory',
        );

        const info: any = networkBus.response;
        console.log("repository factory from IPC: ", info);

        try {
            return await new RepositoryFactoryHttp(info.url, {
                websocketInjected: WebSocket,
                websocketUrl: info.websocketUrl,
            } as RepositoryFactoryConfig);
        }
        catch(e) {
            throw new Error(`Connection to endpoint "${info.url}" could not be established. Reason: ${e.toString()}`);
        }
    }

    /**
     * 
     */
     public async getCurrentSigner(): Promise<Address> {
        // Uses IPC to get repository factory from app store (Vuex)
        const networkBus = await PluginBridge.StoreActionRequest(
            '@yourdlt/plugin-ninjazzz',
            'getter',
            'account/currentSignerAddress',
        );

        const info: any = networkBus.response;
        console.log("current signer from IPC: ", info);

        return Address.createFromRawAddress(info.address);
    }
    /// end-region public API
}
