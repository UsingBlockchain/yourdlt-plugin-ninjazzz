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
  <div class="modal-ninja-catcher-wrapper">
    <Modal v-model="show" :title="title" :transfer="false" :footer-hide="true">
      <div class="container">
        <div class="body-text">
          <p>Click the appearing image to find the Ninja Rewards.</p>
        </div>
        <hr class="separator" />
        <div class="body-text">
          <transition name="fade" appear :duration="2500">
            <div class="ninja-wrapper" @click="confirm">
              <Ninja :color="color" />
            </div>
          </transition>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { BlockInfo } from '@dhealth/sdk'

// internal child components
import Ninja from '../Ninja/Ninja.vue';

@Component({
  components: {
    Ninja,
  }
})
export default class ModalNinjaCatcher extends Vue {
  /**
   * Modal title
   * @type {string}
   */
  @Prop({ default: '' }) title: string;

  /**
   * Modal visibility state from parent
   * @type {string}
   */
  @Prop({ default: false }) visible: boolean;

  /**
   * Block received
   * @type {BlockInfo}
   */
  @Prop({ default: undefined }) block: BlockInfo;

  /**
   * Whether currently performing an update or not.
   * @var {boolean}
   */
  protected performingCatch: boolean = false;

  /**
   * Timestamp of the last rendering event.
   * @var {number}
   */
  protected lastRenderTime: number = new Date().valueOf();

  /**
   * The color of the displayed ninja.
   * @var {string}
   */
  protected color: string = '#ff0000';

  /// region computed properties
  /**
   * Internal visibility state
   * @type {boolean}
   */
  public get show(): boolean {
    return this.visible;
  }

  /**
   * Display or hide the modal box.
   *
   * @emits close
   * @param   {boolean}   val
   * @returns {void}
   */
  public set show(val) {
    if (!val) {
      this.$emit('close');
    }
  }
  /// end-region computed properties

  /// region component methods
  public created() {
    this.lastRenderTime = new Date().valueOf();
    this.color = `#${this.block.hash.substr(0, 6)}`;
  }

  /**
   * Confirm a caught ninja. This method will
   * also close the modal box.
   *
   * @emits   caught
   * @returns {void}
   */
  public async confirm() {
    if (this.performingCatch) {
      return;
    }

    this.performingCatch = true;
    return await new Promise((resolve, reject) => {
      this.$emit('caught', this.block);
      this.closeModal();
      return resolve(true);
    }).finally(() => (this.performingCatch = false));
  }
  /// end-region component methods

  /// region private API
  /**
   * Hide the modal box.
   *
   * @returns {void}
   */
  private closeModal() {
    this.show = false;
  }
  /// end-region private API
}
</script>

<style lang="less" scoped>
@import './ModalNinjaCatcher.less';
</style>
