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
  <div class="modal-ninja-viewer-wrapper">
    <Modal v-model="show" :title="title" :transfer="false" :footer-hide="true">
      <div class="container">
        <div class="body-text">
          <p>Congratulations, you have caught this ninja on block {{ninja.height}}!</p>
        </div>
        <hr class="separator" />
        <div class="body-text">
          <transition name="fade" appear :duration="2500">
            <div class="ninja-wrapper">
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
import { BlockInfo } from 'symbol-sdk'

// internal child components
import Ninja from '../Ninja/Ninja.vue';

@Component({
  components: {
    Ninja,
  }
})
export default class ModalNinjaViewer extends Vue {
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
  @Prop({ default: undefined }) ninja: { owner: string, height: string, hash: string };

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
    this.color = `#${this.ninja.hash.substr(0, 6)}`;
  }
  /// end-region component methods
}
</script>

<style lang="less" scoped>
@import './ModalNinjaViewer.less';
</style>
