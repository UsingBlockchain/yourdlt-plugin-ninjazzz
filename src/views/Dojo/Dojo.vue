<!--
/**
 * This file is part of YourDLT Wallet Plugins shared under LGPL-3.0
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     YourDLT Wallet Plugins
 * @subpackage  @yourdlt/plugin-ninjazzz
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     LGPL-3.0
 */
-->
<template>
  <div class="yourdlt-plugin-ninjazzz-container">
    <div class="dashboard-left-container">
      <div class="title">
        <span class="title_txt">{{ 'NinjaZZZ' }}</span>
      </div>
      <div class="history-wrapper">
        <GenericTableDisplay
          class="table-section"
          :items="myNinjas"
          :fields="ninjaFields"
          :page-size="10"
          :disable-headers="!myNinjas || !myNinjas.length"
          :disable-single-page-links="false"
          :disable-rows-grid="true"
          :disable-placeholder-grid="true"
          :key="ninjasTimestamp"
        >
          <template v-slot:table-title>
            <h1 class="section-title">
              {{ 'Ninjas' }}
            </h1>
          </template>
          <template v-slot:empty>
            <h2 class="empty-list">You haven't caught any NinjaZZZ. Hint: <b>Idle time</b>.</h2>
          </template>
          <template v-slot:rows="props">
            <GenericTableRow
              v-for="(rowValues, index) in props.items"
              :key="index"
              :row-values="rowValues"
              @on-remove="$emit('on-remove', rowValues)"
              @click="onClickNinja(rowValues.hash)"
            />
          </template>
        </GenericTableDisplay>
      </div>
    </div>
    <div class="dashboard-right-container">
      <div class="title">
        <span class="title_txt">{{ 'Plugin details' }}</span>
      </div>
      <p>The <b>NinjaZZZ</b> game consists in clickable images of Ninjas appearing during idle time. Stay here until the next block is harvested and enjoy!</p>
      <p>This showcase illustrates how to listen for blocks on the dHealth Network and how to map actions directly to [specific] network activity.</p>
      <p>Whenever the NinjaZZZ game is rendered, a block listener is started that will display a Ninja whenever a new block is harvested on the network.</p>
      <p>What happens if you click the appearing Ninja(s) - is up for you to find out.</p>
      <p>Catch them all!</p>
      <a
        class="github-fork-ribbon right-bottom"
        :href="forkUrl"
        target="_blank"
        data-ribbon="Fork me on GitHub"
        title="Fork me on GitHub">Fork me on GitHub</a>
    </div>

    <ModalNinjaCatcher
      v-if="!showNinjaViewerModal && showNinjaModal"
      :visible="!showNinjaViewerModal && showNinjaModal"
      :title="'Catch the NinjaZZZ'"
      :block="lastBlock"
      @caught="saveNinja"
    />

    <ModalNinjaViewer
      v-if="showNinjaViewerModal"
      :visible="showNinjaViewerModal"
      :title="'Congratulations for this NinjaZZZ!'"
      :ninja="lastClickedNinja"
      @close="showNinjaViewerModal = false"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { GenericTableDisplay, GenericTableRow } from '@yourdlt/wallet-components';
import { Address, BlockInfo, Deadline, IListener, NetworkType, PlainMessage, RepositoryFactoryHttp, TransactionMapping, TransferTransaction, UInt64 } from 'symbol-sdk';
import { Subscription } from 'rxjs';
import { TransactionURI } from 'symbol-uri-scheme';

// internal dependencies
import { NetworkService } from '../../services/NetworkService';
import { NinjaService } from '../../services/NinjaService';
import { AddressShortener } from '../../Helpers';

// internal child components
import ModalNinjaCatcher from '../ModalNinjaCatcher/ModalNinjaCatcher.vue';
import ModalNinjaViewer from '../ModalNinjaViewer/ModalNinjaViewer.vue';

type NinjaModel = { 
  owner: string,
  height: string,
  hash: string
};

@Component({
  components: {
    GenericTableDisplay,
    GenericTableRow,
    ModalNinjaCatcher,
    ModalNinjaViewer,
  }
})
export default class Dojo extends Vue {

  @Prop({ default: 'https://github.com/UsingBlockchain/yourdlt-plugin-ninjazzz' })
  public forkUrl: string;

  /**
   * Whether currently displaying the CATCH modal box
   * @var {boolean}
   */
  public showNinjaModal: boolean = false;

  /**
   * Whether currently displaying the VIEWER modal box
   * @var {boolean}
   */
  public showNinjaViewerModal: boolean = false;

  /**
   * Unfiltered list of caught ninjas
   * @var {NinjaModel[]}
   */
  public myNinjas: NinjaModel[];

  /**
   * The current signer address.
   * @var {Address}
   */
  protected currentSigner: Address;

  /**
   * Timestamp of the last update of caught ninjas.
   * @var {number}
   */
  protected lastUpdatedNinjas: number = new Date().valueOf();

  /**
   * The current listener instance.
   * @var {IListener}
   */
  protected currentListener: IListener;

  /**
   * The current block handler subscription.
   * @var {Subscription}
   */
  protected currentSubscription: Subscription;

  /**
   * The network repository factory.
   * @var {RepositoryFactoryHttp}
   */
  protected repositoryFactory: RepositoryFactoryHttp;

  /**
   * The last block received.
   * @var {BlockInfo}
   */
  protected lastBlock: BlockInfo;

  /**
   * Network epoch adjustment.
   * @var {number}
   */
  protected epochAdjustment: number;

  /**
   * Network type.
   * @var {NetworkType}
   */
  protected networkType: NetworkType;

  /**
   * Network generation hash (seed generation hash).
   * @var {string}
   */
  protected generationHash: string;

  /**
   * The last clicked Ninja.
   * @var {BlockInfo}
   */
  protected lastClickedNinja: NinjaModel;

  /// region computed properties
  public get ninjaFields(): any[] {
    return [
      { name: 'height', label: 'Block Height' },
      { name: 'hash', label: 'Ninja Hash' },
      { name: 'owner', label: 'Caught by' }
    ];
  }

  public get ninjasTimestamp(): number {
    return this.lastUpdatedNinjas;
  }
  /// end-region computed properties

  /// region component methods
  public async created() {
    const service = new NetworkService();

    // Uses IPC to get repository factory from app store (Vuex)
    this.repositoryFactory = await service.getRepositoryFactory();

    // Reading from repository factory (may need HTTP)
    this.epochAdjustment = await this.repositoryFactory.getEpochAdjustment().toPromise();
    this.networkType = await this.repositoryFactory.getNetworkType().toPromise();
    this.generationHash = await this.repositoryFactory.getGenerationHash().toPromise();

    // Uses IPC to get current signer address from app store (Vuex)
    this.currentSigner = await service.getCurrentSigner();

    // Uses IPC to get data from app database (localStorage)
    await this.refreshData();

    // Connects to Websocket
    this.currentListener = this.repositoryFactory.createListener()
    await this.currentListener.open();

    this.currentSubscription = this.subscribeToBlocks();
  }

  public async beforeDestroy() {
    if (!!this.currentSubscription) {
      this.currentSubscription.unsubscribe();
    }

    if (!!this.currentListener && this.currentListener.isOpen()) {
      await this.currentListener.close();
    }
  }

  public onClickNinja(hash) {
    const ninja: NinjaModel = this.myNinjas.find(
      n => n.hash === hash
    );

    if (!! ninja) {
      this.lastClickedNinja = ninja;
      this.showNinjaViewerModal = true;
    }
  }

  public async saveNinja(block: BlockInfo) {
    // insert in db
    await new NinjaService().createCatch({
      owner: this.currentSigner.plain(),
      height: block.height.compact(),
      hash: block.hash,
    });
    this.showNinjaModal = false;

    // then refresh
    await this.refreshData();

    // prepare transaction and emit to App
    const transfer = TransferTransaction.create(
      Deadline.create(this.epochAdjustment),
      this.currentSigner,
      [],
      PlainMessage.create(`NinjaZZZ: ${block.hash}`),
      this.networkType,
      UInt64.fromUint(30000),
    );

    this.$emit('prepared', new TransactionURI(
      transfer.serialize(),
      TransactionMapping.createFromPayload,
      this.generationHash,
    ));
  }
  /// end-region component methods

  /// region private API
  private subscribeToBlocks() {
    return this.currentListener.newBlock().subscribe((block: BlockInfo) => {
      this.lastBlock = block;
      this.showNinjaModal = true;
      setTimeout(() => this.showNinjaModal = false, 5000);
    });
  }

  private async refreshData() {
    const owner = !!this.currentSigner ? this.currentSigner.plain() : '';
    this.myNinjas = (await new NinjaService().getNinjas(owner)).map(n => ({
      owner: AddressShortener(n.owner),
      height: n.height,
      hash: n.hash
    }));
    this.lastUpdatedNinjas = new Date().valueOf();
  }
  /// end-region private API
}
</script>

<style lang="less" scoped>
@import "./Dojo.less";
@import "./ForkMe.less";
</style>