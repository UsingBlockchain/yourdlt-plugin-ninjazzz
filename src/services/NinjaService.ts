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
import { PluginBridge, RandomIdGenerator } from '@yourdlt/wallet-api-bridge';

/**
 * @class {NinjaService}
 * @description This service class provides methods to handle ninjas
 * storage and state changes.
 */
export class NinjaService {
    /// region public API
    /**
     * Construct a booklet service around an optional \a $app
     * Vue component/parent component.
     *
     * @param {Vue} $app
     */
    public constructor(protected readonly $app?: Vue) {}

    /**
     * This method reads caught ninjas from the local cache and returns
     * unique ninjas entries by `id`.
     *
     * @async
     * @returns {Promise<any[]>}
     */
    public async getNinjas(owner: string): Promise<any[]> {
        // configure filter by owner
        let filters = { /* no-filter */ };
        if (!!owner && owner.length > 0) {
            filters = { owner };
        }

        // use IPC to get data from app database (localStorage)
        const storeBus = await PluginBridge.StoreActionRequest(
            '@yourdlt/plugin-ninjazzz',
            'action',
            'db/SELECT',
            {
                table: 'ninjazzz.catches',
                operation: 'select',
                data: filters
            }
        )

        console.log("ninjas: ", storeBus.response);

        // sort by id (ascending)
        return storeBus.response.map(b => b.values).sort(
            (a, b) => a.id - b.id
        );
    }

    /**
     * This method inserts a new ninja catch entry in the local cache.
     *
     * @async
     * @param   {any}               formItems
     * @returns {Promise<any>}
     */
    public async createCatch(formItems: any): Promise<any> {
        // generates a random id
        const autoId = RandomIdGenerator(8)

        // use IPC to save data in app database (localStorage)
        const storeBus = await PluginBridge.StoreActionRequest(
            '@yourdlt/plugin-ninjazzz',
            'action',
            'db/INSERT',
            {
                table: 'ninjazzz.catches',
                operation: 'insert',
                data: {
                    id: autoId,
                    ...formItems
                } 
            }
        );

        // return the response (may be undefined)
        return storeBus.response;
    }
    /// end-region public API
}

