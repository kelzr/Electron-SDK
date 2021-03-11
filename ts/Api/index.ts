import {
  SoftwareRenderer,
  GlRenderer,
  IRenderer,
  CustomRenderer
} from '../Renderer';
import {
  NodeRtcEngine,
  NodeRtcChannel,
  RtcStats,
  LocalVideoStats,
  LocalAudioStats,
  RemoteVideoStats,
  RemoteAudioStats,
  RemoteVideoTransportStats,
  RemoteAudioTransportStats,
  RemoteVideoState,
  RemoteVideoStateReason,
  RemoteAudioState,
  RemoteAudioStateReason,
  AgoraNetworkQuality,
  LastmileProbeResult,
  ClientRoleType,
  StreamType,
  ConnectionState,
  ConnectionChangeReason,
  MediaDeviceType,
  VIDEO_PROFILE_TYPE,
  TranscodingConfig,
  InjectStreamConfig,
  VoiceChangerPreset,
  AudioReverbPreset,
  LastmileProbeConfig,
  Priority,
  CameraCapturerConfiguration,
  ScreenSymbol,
  CaptureRect,
  CaptureParam,
  VideoContentHint,
  VideoEncoderConfiguration,
  UserInfo,
  RendererOptions,
  Metadata,
  RTMP_STREAMING_EVENT,
  AREA_CODE,
  STREAM_PUBLISH_STATE,
  STREAM_SUBSCRIBE_STATE,
  AUDIO_ROUTE_TYPE,
  EncryptionConfig,
  AUDIO_EFFECT_PRESET,
  VOICE_BEAUTIFIER_PRESET,
  AUDIENCE_LATENCY_LEVEL_TYPE,
  ClientRoleOptions,
  CLOUD_PROXY_TYPE,
  LogConfig,
  VOICE_CONVERSION_PRESET,
  DataStreamConfig,
  LOCAL_AUDIO_STREAM_ERROR,
  LOCAL_AUDIO_STREAM_STATE,
  LOCAL_VIDEO_STREAM_STATE,
  LOCAL_VIDEO_STREAM_ERROR
} from './native_type';
import { EventEmitter } from 'events';
import { deprecate, config, Config } from '../Utils';
import { ChannelMediaOptions, WatermarkOptions } from './native_type';
import {
  ChannelMediaRelayEvent,
  ChannelMediaRelayState,
  ChannelMediaRelayError,
  ChannelMediaRelayConfiguration
} from './native_type';
import {
  PluginInfo,
  Plugin
} from './plugin';
const agora = require('../../build/Release/agora_node_ext');


/**
 * The AgoraRtcEngine class.
 */
class AgoraRtcEngine extends EventEmitter {
  rtcEngine: NodeRtcEngine;
  streams: Map<string, Map<string, IRenderer[]>>;
  renderMode: 1 | 2 | 3;
  customRenderer: any;
  constructor() {
    super();
    this.rtcEngine = new agora.NodeRtcEngine();
    this.initEventHandler();
    this.streams = new Map();
    this.renderMode = this._checkWebGL() ? 1 : 2;
    this.customRenderer = CustomRenderer;
  }

  /**
   * return sdk config object
   */
  getConfigObject(): Config {
    return config
  }
  /** @zh-cn
   * 设置渲染模式。
   *
   * 该方法确定是使用 WebGL 渲染还是软件渲染。
   * @param {1|2|3} mode 渲染模式：
   * - 1：使用 WebGL 渲染
   * - 2：使用软件渲染
   * - 3：使用自定义渲染
   */
  /** Sets the view render mode.
   *
   * Decide whether to use webgl/software/custom rendering.
   * @param {1|2|3} mode:
   * - 1 for old webgl rendering.
   * - 2 for software rendering.
   * - 3 for custom rendering.
   */
  setRenderMode(mode: 1 | 2 | 3 = 1): void {
    this.renderMode = mode;
  }

  /** @zh-cn
   * 当 {@link setRenderMode} 方法中的渲染模式设置为 `3` 时，调用该方法可以设备自定义的渲染器。
   * `customRender` 是一个类.
   * @param {IRenderer} customRenderer 自定义渲染器
   */
  /**
   * Use this method to set custom Renderer when set renderMode in the
   * {@link setRenderMode} method to 3.
   * CustomRender should be a class.
   * @param {IRenderer} customRenderer Customizes the video renderer.
   */
  setCustomRenderer(customRenderer: IRenderer) {
    this.customRenderer = customRenderer;
  }

  /** @zh-cn
   * @ignore
   */
  /**
   * @private
   * @ignore
   * check if WebGL will be available with appropriate features
   * @return {boolean}
   */
  _checkWebGL(): boolean {
    const canvas = document.createElement('canvas');
    let gl;

    canvas.width = 1;
    canvas.height = 1;

    const options = {
      // Turn off things we don't need
      alpha: false,
      depth: false,
      stencil: false,
      antialias: false,
      preferLowPowerToHighPerformance: true

      // Still dithering on whether to use this.
      // Recommend avoiding it, as it's overly conservative
      // failIfMajorPerformanceCaveat: true
    };

    try {
      gl =
        canvas.getContext('webgl', options) ||
        canvas.getContext('experimental-webgl', options);
    } catch (e) {
      return false;
    }
    if (gl) {
      return true;
    } else {
      return false;
    }
  }

  /** @zh-cn
   * @ignore
   */
  /**
   * init event handler
   * @private
   * @ignore
   */
  initEventHandler(): void {
    const self = this;

    const fire = (event: string, ...args: Array<any>) => {
      setImmediate(() => {
        this.emit(event, ...args);
      });
    };

    this.rtcEngine.onEvent('apierror', (funcName: string) => {
      console.error(`api ${funcName} failed. this is an error
              thrown by c++ addon layer. it often means sth is
              going wrong with this function call and it refused
              to do what is asked. kindly check your parameter types
              to see if it matches properly.`);
    });

    this.rtcEngine.onEvent('joinchannel', function(
      channel: string,
      uid: number,
      elapsed: number
    ) {
      fire('joinedchannel', channel, uid, elapsed);
      fire('joinedChannel', channel, uid, elapsed);
    });

    this.rtcEngine.onEvent('rejoinchannel', function(
      channel: string,
      uid: number,
      elapsed: number
    ) {
      fire('rejoinedchannel', channel, uid, elapsed);
      fire('rejoinedChannel', channel, uid, elapsed);
    });

    this.rtcEngine.onEvent('warning', function(warn: number, msg: string) {
      fire('warning', warn, msg);
    });

    this.rtcEngine.onEvent('error', function(err: number, msg: string) {
      fire('error', err, msg);
    });

    // this.rtcEngine.onEvent('audioquality', function(uid: number, quality: AgoraNetworkQuality, delay: number, lost: number) {
    //   fire('audioquality', uid, quality, delay, lost);
    //   fire('audioQuality', uid, quality, delay, lost);
    // });

    this.rtcEngine.onEvent('audiovolumeindication', function(
      speakers: {
        uid: number;
        volume: number;
        vad: boolean;
      }[],
      speakerNumber: number,
      totalVolume: number
    ) {
      fire('audioVolumeIndication', speakers, speakerNumber, totalVolume);
      fire('groupAudioVolumeIndication', speakers, speakerNumber, totalVolume);
    });

    this.rtcEngine.onEvent('leavechannel', function(rtcStats: RtcStats) {
      fire('leavechannel', rtcStats);
      fire('leaveChannel', rtcStats);
    });

    this.rtcEngine.onEvent('rtcstats', function(stats: RtcStats) {
      fire('rtcstats', stats);
      fire('rtcStats', stats);
    });

    this.rtcEngine.onEvent('localvideostats', function(stats: LocalVideoStats) {
      fire('localvideostats', stats);
      fire('localVideoStats', stats);
    });

    this.rtcEngine.onEvent('localAudioStats', function(stats: LocalAudioStats) {
      fire('localAudioStats', stats);
    });

    this.rtcEngine.onEvent('remotevideostats', function(
      stats: RemoteVideoStats
    ) {
      fire('remotevideostats', stats);
      fire('remoteVideoStats', stats);
    });

    this.rtcEngine.onEvent('remoteAudioStats', function(
      stats: RemoteAudioStats
    ) {
      fire('remoteAudioStats', stats);
    });

    this.rtcEngine.onEvent('remoteAudioTransportStats', function(
      uid: number,
      delay: number,
      lost: number,
      rxKBitRate: number
    ) {
      fire('remoteAudioTransportStats', {
        uid,
        delay,
        lost,
        rxKBitRate
      });
    });

    this.rtcEngine.onEvent('remoteVideoTransportStats', function(
      uid: number,
      delay: number,
      lost: number,
      rxKBitRate: number
    ) {
      fire('remoteVideoTransportStats', {
        uid,
        delay,
        lost,
        rxKBitRate
      });
    });

    this.rtcEngine.onEvent('audiodevicestatechanged', function(
      deviceId: string,
      deviceType: number,
      deviceState: number
    ) {
      fire('audiodevicestatechanged', deviceId, deviceType, deviceState);
      fire('audioDeviceStateChanged', deviceId, deviceType, deviceState);
    });

    // this.rtcEngine.onEvent('audiomixingfinished', function() {
    //   fire('audiomixingfinished');
    //   fire('audioMixingFinished');
    // });

    this.rtcEngine.onEvent('audioMixingStateChanged', function(
      state: number,
      err: number
    ) {
      fire('audioMixingStateChanged', state, err);
    });

    this.rtcEngine.onEvent('apicallexecuted', function(
      api: string,
      err: number
    ) {
      fire('apicallexecuted', api, err);
      fire('apiCallExecuted', api, err);
    });

    this.rtcEngine.onEvent('remoteaudiomixingbegin', function() {
      fire('remoteaudiomixingbegin');
      fire('remoteAudioMixingBegin');
    });

    this.rtcEngine.onEvent('remoteaudiomixingend', function() {
      fire('remoteaudiomixingend');
      fire('remoteAudioMixingEnd');
    });

    this.rtcEngine.onEvent('audioeffectfinished', function(soundId: number) {
      fire('audioeffectfinished', soundId);
      fire('audioEffectFinished', soundId);
    });

    this.rtcEngine.onEvent('videodevicestatechanged', function(
      deviceId: string,
      deviceType: number,
      deviceState: number
    ) {
      fire('videodevicestatechanged', deviceId, deviceType, deviceState);
      fire('videoDeviceStateChanged', deviceId, deviceType, deviceState);
    });

    this.rtcEngine.onEvent('networkquality', function(
      uid: number,
      txquality: AgoraNetworkQuality,
      rxquality: AgoraNetworkQuality
    ) {
      fire('networkquality', uid, txquality, rxquality);
      fire('networkQuality', uid, txquality, rxquality);
    });

    this.rtcEngine.onEvent('lastmilequality', function(
      quality: AgoraNetworkQuality
    ) {
      fire('lastmilequality', quality);
      fire('lastMileQuality', quality);
    });

    this.rtcEngine.onEvent('lastmileProbeResult', function(
      result: LastmileProbeResult
    ) {
      fire('lastmileProbeResult', result);
    });

    this.rtcEngine.onEvent('firstlocalvideoframe', function(
      width: number,
      height: number,
      elapsed: number
    ) {
      fire('firstlocalvideoframe', width, height, elapsed);
      fire('firstLocalVideoFrame', width, height, elapsed);
    });

    this.rtcEngine.onEvent('firstremotevideodecoded', function(
      uid: number,
      width: number,
      height: number,
      elapsed: number
    ) {
      fire('addstream', uid, elapsed);
      fire('addStream', uid, elapsed);
      fire('firstRemoteVideoDecoded', uid, width, height, elapsed);
    });

    this.rtcEngine.onEvent('videosizechanged', function(
      uid: number,
      width: number,
      height: number,
      rotation: number
    ) {
      fire('videosizechanged', uid, width, height, rotation);
      fire('videoSizeChanged', uid, width, height, rotation);
    });

    this.rtcEngine.onEvent('firstremotevideoframe', function(
      uid: number,
      width: number,
      height: number,
      elapsed: number
    ) {
      fire('firstremotevideoframe', uid, width, height, elapsed);
      fire('firstRemoteVideoFrame', uid, width, height, elapsed);
    });

    this.rtcEngine.onEvent('userjoined', function(
      uid: number,
      elapsed: number
    ) {
      console.log('user : ' + uid + ' joined.');
      fire('userjoined', uid, elapsed);
      fire('userJoined', uid, elapsed);
    });

    this.rtcEngine.onEvent('useroffline', function(
      uid: number,
      reason: number
    ) {
      fire('userOffline', uid, reason);
      if (!self.streams) {
        self.streams = new Map();
        console.log('Warning!!!!!!, streams is undefined.');
        return;
      }
      self.destroyRender(uid, "");
      self.rtcEngine.unsubscribe(uid);
      fire('removestream', uid, reason);
      fire('removeStream', uid, reason);
    });

    this.rtcEngine.onEvent('usermuteaudio', function(
      uid: number,
      muted: boolean
    ) {
      fire('usermuteaudio', uid, muted);
      fire('userMuteAudio', uid, muted);
    });

    this.rtcEngine.onEvent('usermutevideo', function(
      uid: number,
      muted: boolean
    ) {
      fire('usermutevideo', uid, muted);
      fire('userMuteVideo', uid, muted);
    });

    this.rtcEngine.onEvent('userenablevideo', function(
      uid: number,
      enabled: boolean
    ) {
      fire('userenablevideo', uid, enabled);
      fire('userEnableVideo', uid, enabled);
    });

    this.rtcEngine.onEvent('userenablelocalvideo', function(
      uid: number,
      enabled: boolean
    ) {
      fire('userenablelocalvideo', uid, enabled);
      fire('userEnableLocalVideo', uid, enabled);
    });

    this.rtcEngine.onEvent('cameraready', function() {
      fire('cameraready');
      fire('cameraReady');
    });

    this.rtcEngine.onEvent('videostopped', function() {
      fire('videostopped');
      fire('videoStopped');
    });

    this.rtcEngine.onEvent('connectionlost', function() {
      fire('connectionlost');
      fire('connectionLost');
    });

    // this.rtcEngine.onEvent('connectioninterrupted', function() {
    //   fire('connectioninterrupted');
    //   fire('connectionInterrupted');
    // });

    // this.rtcEngine.onEvent('connectionbanned', function() {
    //   fire('connectionbanned');
    //   fire('connectionBanned');
    // });

    // this.rtcEngine.onEvent('refreshrecordingservicestatus', function(status: any) {
    //   fire('refreshrecordingservicestatus', status);
    //   fire('refreshRecordingServiceStatus', status);
    // });

    this.rtcEngine.onEvent('streammessage', function(
      uid: number,
      streamId: number,
      msg: string,
      len: number
    ) {
      fire('streammessage', uid, streamId, msg, len);
      fire('streamMessage', uid, streamId, msg, len);
    });

    this.rtcEngine.onEvent('streammessageerror', function(
      uid: number,
      streamId: number,
      code: number,
      missed: number,
      cached: number
    ) {
      fire('streammessageerror', uid, streamId, code, missed, cached);
      fire('streamMessageError', uid, streamId, code, missed, cached);
    });

    this.rtcEngine.onEvent('mediaenginestartcallsuccess', function() {
      fire('mediaenginestartcallsuccess');
      fire('mediaEngineStartCallSuccess');
    });

    this.rtcEngine.onEvent('requestchannelkey', function() {
      fire('requestchannelkey');
      fire('requestChannelKey');
    });

    this.rtcEngine.onEvent('firstlocalaudioframe', function(elapsed: number) {
      fire('firstlocalaudioframe', elapsed);
      fire('firstLocalAudioFrame', elapsed);
    });

    this.rtcEngine.onEvent('firstremoteaudioframe', function(
      uid: number,
      elapsed: number
    ) {
      fire('firstremoteaudioframe', uid, elapsed);
      fire('firstRemoteAudioFrame', uid, elapsed);
    });

    this.rtcEngine.onEvent('firstRemoteAudioDecoded', function(
      uid: number,
      elapsed: number
    ) {
      fire('firstRemoteAudioDecoded', uid, elapsed);
    });

    this.rtcEngine.onEvent('remoteVideoStateChanged', function(
      uid: number,
      state: RemoteVideoState,
      reason: RemoteVideoStateReason,
      elapsed: number
    ) {
      fire('remoteVideoStateChanged', uid, state, reason, elapsed);
    });

    this.rtcEngine.onEvent('cameraFocusAreaChanged', function(
      x: number,
      y: number,
      width: number,
      height: number
    ) {
      fire('cameraFocusAreaChanged', x, y, width, height);
    });

    this.rtcEngine.onEvent('cameraExposureAreaChanged', function(
      x: number,
      y: number,
      width: number,
      height: number
    ) {
      fire('cameraExposureAreaChanged', x, y, width, height);
    });

    this.rtcEngine.onEvent('tokenPrivilegeWillExpire', function(token: string) {
      fire('tokenPrivilegeWillExpire', token);
    });

    this.rtcEngine.onEvent('streamPublished', function(
      url: string,
      error: number
    ) {
      fire('streamPublished', url, error);
    });

    this.rtcEngine.onEvent('streamUnpublished', function(url: string) {
      fire('streamUnpublished', url);
    });

    this.rtcEngine.onEvent('transcodingUpdated', function() {
      fire('transcodingUpdated');
    });

    this.rtcEngine.onEvent('streamInjectStatus', function(
      url: string,
      uid: number,
      status: number
    ) {
      fire('streamInjectStatus', url, uid, status);
    });

    this.rtcEngine.onEvent('localPublishFallbackToAudioOnly', function(
      isFallbackOrRecover: boolean
    ) {
      fire('localPublishFallbackToAudioOnly', isFallbackOrRecover);
    });

    this.rtcEngine.onEvent('remoteSubscribeFallbackToAudioOnly', function(
      uid: number,
      isFallbackOrRecover: boolean
    ) {
      fire('remoteSubscribeFallbackToAudioOnly', uid, isFallbackOrRecover);
    });

    this.rtcEngine.onEvent('microphoneEnabled', function(enabled: boolean) {
      fire('microphoneEnabled', enabled);
    });

    this.rtcEngine.onEvent('connectionStateChanged', function(
      state: ConnectionState,
      reason: ConnectionChangeReason
    ) {
      fire('connectionStateChanged', state, reason);
    });

    this.rtcEngine.onEvent('activespeaker', function(uid: number) {
      fire('activespeaker', uid);
      fire('activeSpeaker', uid);
    });

    this.rtcEngine.onEvent('clientrolechanged', function(
      oldRole: ClientRoleType,
      newRole: ClientRoleType
    ) {
      fire('clientrolechanged', oldRole, newRole);
      fire('clientRoleChanged', oldRole, newRole);
    });

    this.rtcEngine.onEvent('audiodevicevolumechanged', function(
      deviceType: MediaDeviceType,
      volume: number,
      muted: boolean
    ) {
      fire('audiodevicevolumechanged', deviceType, volume, muted);
      fire('audioDeviceVolumeChanged', deviceType, volume, muted);
    });

    this.rtcEngine.onEvent('videosourcejoinsuccess', function(uid: number) {
      fire('videosourcejoinedsuccess', uid);
      fire('videoSourceJoinedSuccess', uid);
    });

    this.rtcEngine.onEvent('videosourcerequestnewtoken', function() {
      fire('videosourcerequestnewtoken');
      fire('videoSourceRequestNewToken');
    });

    this.rtcEngine.onEvent('videosourceleavechannel', function() {
      fire('videosourceleavechannel');
      fire('videoSourceLeaveChannel');
    });

    this.rtcEngine.onEvent('videoSourceLocalAudioStats', function(stats: LocalAudioStats) {
      fire('videoSourceLocalAudioStats', stats);
    });

    this.rtcEngine.onEvent('videoSourceLocalVideoStats', function(stats: LocalVideoStats) {
      fire('videoSourceLocalVideoStats', stats);
    });

    this.rtcEngine.onEvent('videoSourceVideoSizeChanged', function(uid: number, width: number, height: number, rotation: number) {
      fire('videoSourceVideoSizeChanged', uid, width, height, rotation);
    });

    this.rtcEngine.onEvent('localUserRegistered', function(
      uid: number,
      userAccount: string
    ) {
      fire('localUserRegistered', uid, userAccount);
    });

    this.rtcEngine.onEvent('userInfoUpdated', function(
      uid: number,
      userInfo: UserInfo
    ) {
      fire('userInfoUpdated', uid, userInfo);
    });

    this.rtcEngine.onEvent('localVideoStateChanged', function(
      localVideoState: LOCAL_VIDEO_STREAM_STATE,
      err: LOCAL_VIDEO_STREAM_ERROR
    ) {
      fire('localVideoStateChanged', localVideoState, err);
    });

    this.rtcEngine.onEvent('localAudioStateChanged', function(
      state: LOCAL_AUDIO_STREAM_STATE,
      err: LOCAL_AUDIO_STREAM_ERROR
    ) {
      fire('localAudioStateChanged', state, err);
    });

    this.rtcEngine.onEvent('remoteAudioStateChanged', function(
      uid: number,
      state: RemoteAudioState,
      reason: RemoteAudioStateReason,
      elapsed: number
    ) {
      fire('remoteAudioStateChanged', uid, state, reason, elapsed);
    });

    this.rtcEngine.onEvent('audioMixingStateChanged', function(
      state: number,
      errorCode: number
    ) {
      fire('audioMixingStateChanged', state, errorCode);
    });

    this.rtcEngine.onEvent('channelMediaRelayState', function(
      state: ChannelMediaRelayState,
      code: ChannelMediaRelayError
    ) {
      fire('channelMediaRelayState', state, code);
    });

    this.rtcEngine.onEvent('channelMediaRelayEvent', function(
      event: ChannelMediaRelayEvent
    ) {
      fire('channelMediaRelayEvent', event);
    });

    this.rtcEngine.onEvent('rtmpStreamingStateChanged', function(url:string, state: number, errCode: number) {
      fire('rtmpStreamingStateChanged', url, state, errCode);
    })

    this.rtcEngine.onEvent('firstLocalAudioFramePublished', function(elapsed: number) {
      fire('firstLocalAudioFramePublished', elapsed);
    })

    this.rtcEngine.onEvent('firstLocalVideoFramePublished', function(elapsed: number) {
      fire('firstLocalVideoFramePublished', elapsed);
    })

    this.rtcEngine.onEvent('rtmpStreamingEvent', function(url: string, eventCode: RTMP_STREAMING_EVENT) {
      fire('rtmpStreamingEvent', url, eventCode);
    })

    this.rtcEngine.onEvent('audioPublishStateChanged', function(channel: string, oldState: STREAM_PUBLISH_STATE, newState: STREAM_PUBLISH_STATE, elapseSinceLastState: number) {
      fire('audioPublishStateChanged', channel, oldState, newState, elapseSinceLastState);
    })

    this.rtcEngine.onEvent('videoPublishStateChanged', function(channel: string, oldState: STREAM_PUBLISH_STATE, newState: STREAM_PUBLISH_STATE, elapseSinceLastState: number) {
      fire('videoPublishStateChanged', channel, oldState, newState, elapseSinceLastState);
    })

    this.rtcEngine.onEvent('audioSubscribeStateChanged', function(channel: string, uid: number, oldState: STREAM_SUBSCRIBE_STATE, newState: STREAM_SUBSCRIBE_STATE, elapseSinceLastState: number) {
      fire('audioSubscribeStateChanged', channel, uid, oldState, newState, elapseSinceLastState);
    })

    this.rtcEngine.onEvent('videoSubscribeStateChanged', function(channel: string, uid: number, oldState: STREAM_SUBSCRIBE_STATE, newState: STREAM_SUBSCRIBE_STATE, elapseSinceLastState: number) {
      fire('videoSubscribeStateChanged', channel, uid, oldState, newState, elapseSinceLastState);
    })

    this.rtcEngine.onEvent('audioRouteChanged', function(routing: AUDIO_ROUTE_TYPE) {
      fire('audioRouteChanged', routing);
    })

    this.rtcEngine.onEvent('uploadLogResult', function(requestId: string, success: boolean, reason: number) {
      fire('uploadLogResult', requestId, success, reason);
    })

    this.rtcEngine.onEvent('videoSourceLocalAudioStateChanged', function(state: LOCAL_AUDIO_STREAM_STATE, error: LOCAL_AUDIO_STREAM_ERROR) {
      fire('videoSourceLocalAudioStateChanged', state, error);
    })

    this.rtcEngine.onEvent('videoSourceLocalVideoStateChanged', function(state: LOCAL_VIDEO_STREAM_STATE, error: LOCAL_VIDEO_STREAM_ERROR) {
      fire('videoSourceLocalVideoStateChanged', state, error);
    })

    this.rtcEngine.registerDeliverFrame(function(infos: any) {
      self.onRegisterDeliverFrame(infos);
    });
  }

  /** @zh-cn
   * @ignore
   */
  /**
   * @private
   * @ignore
   * @param {number} type 0-local 1-remote 2-device_test 3-video_source
   * @param {number} uid uid get from native engine, differ from electron engine's uid
   */ //TODO(input)
  _getRenderers(type: number, uid: number, channelId: string | undefined): IRenderer[] | undefined {
    let channelStreams = this._getChannelRenderers(channelId || "")
    if (type < 2) {
      if (uid === 0) {
        return channelStreams.get('local');
      } else {
        return channelStreams.get(String(uid));
      }
    } else if (type === 2) {
      // return this.streams.devtest;
      console.warn('Type 2 not support in production mode.');
      return;
    } else if (type === 3) {
      return channelStreams.get('videosource');
    } else {
      console.warn('Invalid type for getRenderer, only accept 0~3.');
      return;
    }
  }
  //TODO(input)
  _getChannelRenderers(channelId: string): Map<string, IRenderer[]> {
    let channel: Map<string, IRenderer[]>;
    if(!this.streams.has(channelId)) {
      channel = new Map()
      this.streams.set(channelId, channel)
    } else {
      channel = this.streams.get(channelId) as Map<string, IRenderer[]>
    }
    return channel
  }

  /** @zh-cn
   * @ignore
   */
  /**
   * check if data is valid
   * @private
   * @ignore
   * @param {*} header
   * @param {*} ydata
   * @param {*} udata
   * @param {*} vdata
   *///TODO(input)
  _checkData(
    header: ArrayBuffer,
    ydata: ArrayBuffer,
    udata: ArrayBuffer,
    vdata: ArrayBuffer
  ) {
    if (header.byteLength != 20) {
      console.error('invalid image header ' + header.byteLength);
      return false;
    }
    if (ydata.byteLength === 20) {
      console.error('invalid image yplane ' + ydata.byteLength);
      return false;
    }
    if (udata.byteLength === 20) {
      console.error('invalid image uplanedata ' + udata.byteLength);
      return false;
    }
    if (
      ydata.byteLength != udata.byteLength * 4 ||
      udata.byteLength != vdata.byteLength
    ) {
      console.error(
        'invalid image header ' +
          ydata.byteLength +
          ' ' +
          udata.byteLength +
          ' ' +
          vdata.byteLength
      );
      return false;
    }

    return true;
  }

  /** @zh-cn
   * @ignore
   */
  /**
   * register renderer for target info
   * @private
   * @ignore
   * @param {number} infos
   */
  onRegisterDeliverFrame(infos: any) {
    const len = infos.length;
    for (let i = 0; i < len; i++) {
      const info = infos[i];
      const { type, uid, channelId, header, ydata, udata, vdata } = info;
      if (!header || !ydata || !udata || !vdata) {
        console.log(
          'Invalid data param ： ' +
            header +
            ' ' +
            ydata +
            ' ' +
            udata +
            ' ' +
            vdata
        );
        continue;
      }
      const renderers = this._getRenderers(type, uid, channelId);
      if (!renderers || renderers.length === 0) {
        console.warn(`Can't find renderer for uid : ${uid} ${channelId}`);
        continue;
      }

      if (this._checkData(header, ydata, udata, vdata)) {
        renderers.forEach(renderer => {
          renderer.drawFrame({
            header,
            yUint8Array: ydata,
            uUint8Array: udata,
            vUint8Array: vdata
          });
        })
      }
    }
  }

  /** @zh-cn
   * 更新渲染尺寸。
   * 当视图尺寸发生改变时，该方法可以根据视窗尺寸长宽比更新缩放比例，在收到下一个视频帧时，按照新的比例进行渲染。
   * 该方法可以防止视图不连贯的问题。
   * @param {string|number} key 存储渲染器 Map 的关键标识，如 `uid`、`videoSource` 或 `local`
   */
  /**
   * Resizes the renderer.
   *
   * When the size of the view changes, this method refresh the zoom level so
   * that video is sized appropriately while waiting for the next video frame
   * to arrive.
   *
   * Calling this method prevents a view discontinutity.
   * @param key Key for the map that store the renderers,
   * e.g, `uid` or `videosource` or `local`.
   */
  resizeRender(key: 'local' | 'videosource' | number, channelId:string | undefined) {
    let channelStreams = this._getChannelRenderers(channelId || "")
    if (channelStreams.has(String(key))) {
      const renderers = channelStreams.get(String(key)) || [];
      renderers.forEach(renderer => renderer.refreshCanvas())
    }
  }


  /** @zh-cn
   * 初始化渲染器对象。
   * @param {string|number} key 存储渲染器 Map 的关键标识，如 `uid`、`videosource` 或 `local`
   * @param {Element} view 渲染视频的 Dom
   */
  /**
   * Initializes the renderer.
   * @param key Key for the map that store the renderers,
   * e.g, uid or `videosource` or `local`.
   * @param view The Dom elements to render the video.
   */
  initRender(key: 'local' | 'videosource' | number, view: Element, channelId: string | undefined, options?: RendererOptions) {
    let rendererOptions = {
      append: options ? options.append : false
    }
    let channelStreams = this._getChannelRenderers(channelId || "")

    if (channelStreams.has(String(key))) {
      if(!rendererOptions.append) {
        this.destroyRender(key, channelId || "");
      } else {
        let renderers = channelStreams.get(String(key)) || []
        for(let i = 0; i < renderers.length; i++) {
          if(renderers[i].equalsElement(view)){
            console.log(`view exists in renderer list, ignore`)
            return
          }
        }
      }
    }
    channelStreams = this._getChannelRenderers(channelId || "")
    let renderer: IRenderer;
    if (this.renderMode === 1) {
      renderer = new GlRenderer();
    } else if (this.renderMode === 2) {
      renderer = new SoftwareRenderer();
    } else if (this.renderMode === 3) {
      renderer = new this.customRenderer();
    } else {
      console.warn('Unknown render mode, fallback to 1');
      renderer = new GlRenderer();
    }
    renderer.bind(view);

    if(!rendererOptions.append) {
      channelStreams.set(String(key), [renderer]);
    } else {
      let renderers = channelStreams.get(String(key)) || []
      renderers.push(renderer)
      channelStreams.set(String(key), renderers)
    }
  }
  //TODO(input)
  destroyRenderView(
    key: 'local' | 'videosource' | number, channelId: string | undefined, view: Element,
    onFailure?: (err: Error) => void
  ) {
    let channelStreams = this._getChannelRenderers(channelId || "")
    if (!channelStreams.has(String(key))) {
      return;
    }
    const renderers = channelStreams.get(String(key)) || [];
    const matchRenderers = renderers.filter(renderer => renderer.equalsElement(view))
    const otherRenderers = renderers.filter(renderer => !renderer.equalsElement(view))

    if(matchRenderers.length > 0) {
      let renderer = matchRenderers[0]
      try {
        (renderer as IRenderer).unbind();
        if(otherRenderers.length > 0) {
          // has other renderers left, update
          channelStreams.set(String(key), otherRenderers)
        } else {
          // removed renderer is the only one, remove
          channelStreams.delete(String(key));
        }
        if(channelStreams.size === 0) {
          this.streams.delete(channelId || "")
        }
      } catch (err) {
        onFailure && onFailure(err)
      }
    }

  }

  /** @zh-cn
   * 销毁渲染器对象。
   * @param {string|number} key 存储渲染器 Map 的关键标识，如 `uid`、`videoSource` 或 `local`
   * @param {function} onFailure `destroyRenderer` 方法的错误回调
   */
  /**
   * Destroys the renderer.
   * @param key Key for the map that store the renderers,
   * e.g, `uid` or `videosource` or `local`.
   * @param onFailure The error callback for the {@link destroyRenderer}
   * method.
   */
  destroyRender(
    key: 'local' | 'videosource' | number, channelId: string | undefined,
    onFailure?: (err: Error) => void
  ) {
    let channelStreams = this._getChannelRenderers(channelId || "")
    if (!channelStreams.has(String(key))) {
      return;
    }
    const renderers = channelStreams.get(String(key)) || [];

    let exception = null
    for(let i = 0; i < renderers.length; i++) {
      let renderer = renderers[i]
      try {
        (renderer as IRenderer).unbind();
        channelStreams.delete(String(key));
        if(channelStreams.size === 0) {
          this.streams.delete(channelId || "")
        }
      } catch (err) {
        exception = err
        console.error(`${err.stack}`)
      }
    }
    if(exception) {
      onFailure && onFailure(exception)
    }
  }

  // ===========================================================================
  // BASIC METHODS
  // ===========================================================================

  /** @zh-cn
   * 初始化一个 `AgoraRtcEngine` 实例。
   * @param {string} appid Agora 为 App 开发者签发的 App ID，每个项目都应该有一个独一无二的 App ID
   * @param areaCode 服务器的访问区域。该功能为高级设置，适用于有访问安全限制的场景。支持的区域详见 {@link AREA_CODE}
   * 指定访问区域后，Agora SDK 会连接指定区域内的 Agora 服务器。注解：仅支持指定单个访问区域。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   *  - 错误码 `101`: App ID 无效，请检查你的 App ID
   */
  /**
   * Initializes the Agora service.
   *
   * @param appid The App ID issued to you by Agora.
   * See [How to get the App ID](https://docs.agora.io/en/Agora%20Platform/token#get-an-app-id).
   * Only users in apps with the same App ID can join the same channel and
   * communicate with each other. Use an App ID to create only
   * one `AgoraRtcEngine`. To change your App ID, call `release` to destroy
   * the current `AgoraRtcEngine` and then call `initialize` to create
   * `AgoraRtcEngine` with the new App ID.
   * @param areaCode The region for connection. This advanced feature applies
   * to scenarios that have regional restrictions. For the regions that Agora
   * supports, see {@link AREA_CODE}. After specifying the region, the SDK
   * connects to the Agora servers within that region.
   * @param logConfig The configuration of the log files that the SDK outputs.
   * See {@link LogConfig}. By default, the SDK outputs five log files,
   * `agorasdk.log`, `agorasdk_1.log`, `agorasdk_2.log`, `agorasdk_3.log`,
   * `agorasdk_4.log`, each with a default size of 1024 KB. These log files
   * are encoded in UTF-8. The SDK writes the latest logs in `agorasdk.log`.
   * When `agorasdk.log` is full, the SDK deletes the log file with the
   * earliest modification time among the other four, renames `agorasdk.log`
   * to the name of the deleted log file, and creates a new `agorasdk.log` to
   * record latest logs.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  initialize(appid: string, areaCode: AREA_CODE = (0xFFFFFFFF), logConfig?: LogConfig): number {
    return this.rtcEngine.initialize(appid, areaCode, logConfig);
  }

  /** @zh-cn
   * 创建并获取一个 `AgoraRtcChannel` 对象。
   *
   * 你可以多次调用该方法，创建多个 `AgoraRtcChannel` 对象，再调用各 `AgoraRtcChannel` 对象
   * 中的 {@link joinChannel} 方法，实现同时加入多个频道。
   *
   * 加入多个频道后，你可以同时订阅各个频道的音、视频流；但是同一时间只能在一个频道发布一路音、视频流。
   *
   * @param channelName 能标识频道的频道名，长度在 64 字节以内的字符。以下为支持的字符集
   * 范围（共 89 个字符）：
   * - 26 个小写英文字母 a~z；
   * - 26 个大写英文字母 A~Z；
   * - 10 个数字 0~9；
   * - 空格；
   * - "!"、"#"、"$"、"%"、"&"、"("、")"、"+"、"-"、":"、";"、"<"、"="、"."、">"、"?"、
   * "@"、"["、"]"、"^"、"_"、" {"、"}"、"|"、"~"、","。
   * @note
   * - 该参数没有默认值，请确保对参数设值。
   * - 请勿将该参数设为空字符 ""，否则 SDK 会返回 `ERR_REFUSED(5)`
   *
   * @return
   * - 方法调用成功，返回 AgoraRtcChannel 对象的指针
   * - 方法调用失败，返回一个空指针 NULL
   * - 如果将 `channelName` 设为空字符 ""，SDK 会返回 `ERR_REFUSED(5)`
   */
  /**
   * Creates and gets an `AgoraRtcChannel` object.
   *
   * To join more than one channel, call this method multiple times to create
   * as many `AgoraRtcChannel` objects as needed, and call the
   * {@link AgoraRtcChannel.joinChannel joinChannel} method of each created
   * `AgoraRtcChannel` object.
   *
   * After joining multiple channels, you can simultaneously subscribe to
   * streams of all the channels, but publish a stream in only one channel
   * at one time.
   * @param channelName The unique channel name for an Agora RTC session.
   * It must be in the string format and not exceed 64 bytes in length.
   * Supported character scopes are:
   * - All lowercase English letters: a to z.
   * - All uppercase English letters: A to Z.
   * - All numeric characters: 0 to 9.
   * - The space character.
   * - Punctuation characters and other symbols, including: "!", "#", "$",
   * "%", "&", "(", ")", "+", "-", ":", ";", "<", "=", ".", ">", "?", "@",
   * "[", "]", "^", "_", " {", "}", "|", "~", ",".
   *
   * @note
   * - This parameter does not have a default value. You must set it.
   * - Do not set it as the empty string "". Otherwise, the SDK returns
   * `ERR_REFUSED (5)`.
   *
   * @return
   * - If the method call succeeds, returns the `AgoraRtcChannel` object.
   * - If the method call fails, returns empty or `ERR_REFUSED (5)`.
   */
  createChannel(channelName: string): (AgoraRtcChannel | null) {
    let rtcChannel = this.rtcEngine.createChannel(channelName)
    if(!rtcChannel) {
      return null
    }
    return new AgoraRtcChannel(rtcChannel)
  }
  /** @zh-cn
   * 获取当前 SDK 的版本和 Build 信息。
   * @returns {string} 当前 SDK 的版本
   */
  /**
   * Returns the version and the build information of the current SDK.
   * @return The version of the current SDK.
   */
  getVersion(): string {
    return this.rtcEngine.getVersion();
  }

  /** @zh-cn
   * 获取指定错误码的详细错误信息。
   * @param {number} errorCode 错误码
   * @returns {string} errorCode 描述
   */
  /**
   * Retrieves the error description.
   * @param {number} errorCode The error code.
   * @return The error description.
   */
  getErrorDescription(errorCode: number): string {
    return this.rtcEngine.getErrorDescription(errorCode);
  }

  /** @zh-cn
   * 获取当前网络连接状态。
   * @returns {ConnectionState} connect 网络连接状态
   */
  /**
   * Gets the connection state of the SDK.
   * @return {ConnectionState} Connect states. See {@link ConnectionState}.
   */
  getConnectionState(): ConnectionState {
    return this.rtcEngine.getConnectionState();
  }

  /** @zh-cn
   * 加入频道。
   *
   * 该方法让用户加入通话频道，在同一个频道内的用户可以互相通话，多个用户加入同一个频道，可以群聊。使用不同 App ID 的 App 是不能互通的。如果已在通话中，用户必须调用 {@link leaveChannel} 退出当前通话，才能进入下一个频道。
   *
   * 成功调用该方加入频道后，本地会触发 `joinedChannel` 回调；通信场景下的用户和直播场景下的主播加入频道后，远端会触发 `userJoined` 回调。
   *
   * 在网络状况不理想的情况下，客户端可能会与 Agora 的服务器失去连接；SDK 会自动尝试重连，重连成功后，本地会触发 `rejoinedChannel` 回调。
   *
   * @param {string} token 在 App 服务器端生成的用于鉴权的 Token：
   * - 安全要求不高：你可以填入在 Agora Console 获取到的临时 Token。详见[获取临时 Token](https://docs.agora.io/cn/Video/token?platform=All%20Platforms#获取临时-token)
   * - 安全要求高：将值设为在 App 服务端生成的正式 Token。详见[获取 Token](https://docs.agora.io/cn/Video/token?platform=All%20Platforms#获取正式-token)
   *
   * @param {string} channel （必填）标识通话频道的字符，长度在 64 个字节以内的字符串。以下为支持的字符集范围（共 89 个字符）：
   * - 26 个小写英文字母 a-z
   * - 26 个大写英文字母 A-Z
   * - 10 个数字 0-9
   * - 空格
   * - “!”, “#”, “$”, “%”, “&”, “(”, “)”, “+”, “-”, “:”, “;”, “<”, “=”, “.”, “>”, “?”, “@”, “[”, “]”, “^”, “_”, “{”, “}”, “|”, “~”, “,”
   * @param {string} info (非必选项) 开发者需加入的任何附加信息。一般可设置为空字符串，或频道相关信息。该信息不会传递给频道内的其他用户
   * @param {number} uid 用户 ID，32 位无符号整数。
   * - 建议设置范围：1到 2<sup>32</sup>-1，并保证唯一性。
   * - 如果不指定（即设为 0），SDK 会自动分配一个
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   *  - 错误码 `2`，`3`，`5`
   */
  /**
   * Joins a channel with the user ID, and configures whether to
   * automatically subscribe to the audio or video streams.
   *
   * @since v3.3.1
   *
   * Users in the same channel can talk to each other, and multiple users in
   * the same channel can start a group chat. Users with different App IDs
   * cannot call each other.
   *
   * You must call the {@link leaveChannel} method to exit the current call
   * before entering another channel.
   *
   * A successful `joinChannel` method call triggers the following callbacks:
   * - The local client: `joinChannelSuccess`.
   * - The remote client: `userJoined`, if the user joining the channel is
   * in the `0` (communication) profile, or is a host in the `1`
   * (live streaming) profile.
   *
   * When the connection between the client and the Agora server is
   * interrupted due to poor network conditions, the SDK tries reconnecting
   * to the server.
   *
   * When the local client successfully rejoins the channel, the SDK triggers
   * the `rejoinChannelSuccess` callback on the local client.
   *
   * @note Ensure that the App ID used for generating the token is the same
   * App ID used in the {@link initialize} method for creating an
   * `AgoraRtcEngine` object.
   *
   * @param token The token generated at your server. For details,
   * see [Generate a token](https://docs.agora.io/en/Interactive%20Broadcast/token_server?platform=Electron).
   * @param channelId The unique channel name for the Agora RTC session in
   * the string format smaller than 64 bytes. Supported characters:
   * - All lowercase English letters: a to z.
   * - All uppercase English letters: A to Z.
   * - All numeric characters: 0 to 9.
   * - The space character.
   * - Punctuation characters and other symbols, including:
   * "!", "#", "$", "%", "&", "(", ")", "+", "-", ":", ";", "<", "=", ".",
   * ">", "?", "@", "[", "]", "^", "_", " {", "}", "|", "~", ",".
   * @param info (Optional) Reserved for future use.
   * @param uid (Optional) User ID. A 32-bit unsigned integer with a value
   * ranging from 1 to 2<sup>32</sup>-1. The @p uid must be unique. If
   * a @p uid is not assigned (or set to 0), the SDK assigns and returns
   * a @p uid in the `joinChannelSuccess` callback.
   * Your application must record and maintain the returned `uid`, because the
   * SDK does not do so. **Note**: The ID of each user in the channel should
   * be unique. If you want to join the same channel from different devices,
   * ensure that the user IDs in all devices are different.
   * @param options The channel media options. See {@link ChannelMediaOptions}.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   *    - `-2`: The parameter is invalid.
   *    - `-3`: The SDK fails to be initialized. You can try
   * re-initializing the SDK.
   *    - `-5: The request is rejected. This may be caused by the
   * following:
   *        - You have created an `AgoraRtcChannel` object with the same
   * channel name.
   *        - You have joined and published a stream in a channel created by
   * the `AgoraRtcChannel` object. When you join a channel created by the
   * `AgoraRtcEngine` object, the SDK publishes the local audio and video
   * streams to that channel by default. Because the SDK does not support
   * publishing a local stream to more than one channel simultaneously, an
   * error occurs in this occasion.
   *    - `-7`: The SDK is not initialized before calling
   * this method.
   */
  joinChannel(
    token: string,
    channel: string,
    info: string,
    uid: number,
    options?: ChannelMediaOptions
  ): number {
    return this.rtcEngine.joinChannel(token, channel, info, uid, options);
  }

  /** @zh-cn
   * 离开频道。
   *
   * 离开频道，即机挂断或退出通话。
   *
   * 该方法会把回话相关的所有资源都释放掉。该方法是异步操作，调用返回时并没有真正退出频道。
   * 真正退出频道后，本地会触发 `leaveChannel` 回调；通信场景下的用户和直播场景下的主播离开频道后，远端会触发 `removeStream` 回调。
   *
   * @note
   * - 若想开始下一次通话，必须先调用该方法结束本次通话。
   * - 不管当前是否在通话中，都可以调用该方法，没有副作用。
   * - 如果你调用该方法后立即调用 {@link release} 方法，SDK 将无法触发 `leaveChannel` 回调。
   * - 如果你在输入在线媒体流的过程中调用了该方法， SDK 将自动调用 {@link removeInjectStreamUrl} 方法。
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Allows a user to leave a channel.
   *
   * Allows a user to leave a channel, such as hanging up or exiting a call.
   * The user must call the method to end the call before
   * joining another channel after call the {@link joinChannel} method.
   * This method returns 0 if the user leaves the channel and releases all
   * resources related to the call.
   * This method call is asynchronous, and the user has not left the channel
   * when the method call returns.
   *
   * Once the user leaves the channel, the SDK triggers the leavechannel
   * callback.
   *
   * A successful leavechannel method call triggers the removeStream callback
   * for the remote client when the user leaving the channel
   * is in the Communication channel, or is a host in the `1` (live streaming)
   * profile.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  leaveChannel(): number {
    return this.rtcEngine.leaveChannel();
  }

  /** @zh-cn
   * 释放 `AgoraRtcEngine` 实例。
   *
   * 调用该方法后，用户将无法再使用和回调该 SDK 内的其它方法。
   *
   * @note
   * - 该方法需要在子线程中操作。
   * - 如需再次使用，必须重新初始化 {@link initialize} 一个 `AgoraRtcEngine` 实例。
   *
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Releases the AgoraRtcEngine instance.
   *
   * Once the App calls this method to release the created AgoraRtcEngine
   * instance, no other methods in the SDK
   * can be used and no callbacks can occur. To start it again, initialize
   * {@link initialize} to establish a new
   * AgoraRtcEngine instance.
   *
   * **Note**: Call this method in the subthread.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  release(): number {
    return this.rtcEngine.release();
  }

  /** @zh-cn
   * @deprecated 该方法已废弃。请改用 {@link setAudioProfile}
   * 设置音频高音质选项。
   *
   * 请在加入频道前调用该方法，对其中的三个模式完成设置。加入频道后调用该方法不生效。
   * @param {boolean} fullband 是否启用全频带编解码器（48 kHz 采样率）：
   * - true：启用全频带编解码器
   * - false：禁用全频带编解码器
   * @param {boolean} stereo 是否启用立体声编解码器：
   * - true：启用立体声编解码器
   * - false：禁用立体声编解码器
   * @param {boolean} fullBitrate 是否启用高码率模式：
   * - true：启用高码率模式
   * - false：禁用高码率模式
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @deprecated This method is deprecated. Agora does not recommend using
   * this method. Use {@link setAudioProfile} instead.
   * Sets the high-quality audio preferences.
   *
   * Call this method and set all parameters before joining a channel.
   * @param {boolean} fullband Sets whether to enable/disable full-band
   * codec (48-kHz sample rate).
   * - true: Enable full-band codec.
   * - false: Disable full-band codec.
   * @param {boolean} stereo Sets whether to enable/disable stereo codec.
   * - true: Enable stereo codec.
   * - false: Disable stereo codec.
   * @param {boolean} fullBitrate Sets whether to enable/disable high-bitrate
   * mode.
   * - true: Enable high-bitrate mode.
   * - false: Disable high-bitrate mode.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setHighQualityAudioParameters(
    fullband: boolean,
    stereo: boolean,
    fullBitrate: boolean
  ): number {
    deprecate('setAudioProfile');
    return this.rtcEngine.setHighQualityAudioParameters(
      fullband,
      stereo,
      fullBitrate
    );
  }

  /** @zh-cn
   * 订阅远端用户并初始化渲染器。
   *
   * @param {number} uid 想要订阅的远端用户的 ID
   * @param {Element} view 初始化渲染器的 Dom
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Subscribes to a remote user and initializes the corresponding renderer.
   * @param {number} uid The user ID of the remote user.
   * @param {Element} view The Dom where to initialize the renderer.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */ //TODO(input)
  subscribe(uid: number, view: Element, options?: RendererOptions): number {
    this.initRender(uid, view, "", options);
    return this.rtcEngine.subscribe(uid);
  }
  //TODO(input)
  setupRemoteVideo(uid: number, view?: Element, channel?: string, options?: RendererOptions): number {
    if(view) {
      //bind
      this.initRender(uid, view, channel, options);
      return this.rtcEngine.subscribe(uid, channel);
    } else {
      //unbind
      this.destroyRender(uid, channel);
      return this.rtcEngine.unsubscribe(uid, channel);
    }
  }

  /** @zh-cn
   * 设置本地视图和渲染器。
   *
   * @note 请在主线程调用该方法。
   * @param {Element} view 初始化视图的 Dom
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Sets the local video view and the corresponding renderer.
   * @param {Element} view The Dom element where you initialize your view.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   *///TODO(input)
  setupLocalVideo(view: Element, options?: RendererOptions): number {
    this.initRender('local', view, "", options);
    return this.rtcEngine.setupLocalVideo();
  }

  /** @zh-cn
   *
   * 设置视频渲染的分辨率。
   *
   * 该方法只对发送给 js 层的视频数据有效。其他端的视频分辨率由 {@link setVideoEncoderConfiguration} 方法决定。
   * @param {number} rendertype 渲染器的类型：
   * - 0：本地渲染器
   * - 1：远端渲染器
   * - 2：设备测试
   * - 3：视频源
   * @param {number} uid 目标用户的 ID
   * @param {number} width 想要发送的视频宽度
   * @param {number} height 想要发送的视频高度
   */
  /**
   * Sets the renderer dimension of video.
   *
   * This method ONLY affects size of data sent to js layer, while native video
   * size is determined by {@link setVideoEncoderConfiguration}.
   * @param {*} rendertype The renderer type:
   * - 0: The local renderer.
   * - 1: The remote renderer.
   * - 2: The device test
   * - 3: The video source.
   * @param {*} uid The user ID of the targeted user.
   * @param {*} width The target width.
   * @param {*} height The target height.
   */
  setVideoRenderDimension(
    rendertype: number,
    uid: number,
    width: number,
    height: number
  ) {
    this.rtcEngine.setVideoRenderDimension(rendertype, uid, width, height);
  }

  /** @zh-cn
   * 设置视频的全局渲染帧率。
   *
   * 该方法主要用来提升 js 渲染的性能。完成设置后，视频数据会被强制按设置的帧率进行传输，以降低 js 渲染的 CPU 消耗。
   *
   * @note 该方法不适用于添加至高帧率传输流的视频视图。
   *
   * @param {number} fps 渲染帧率（fps）
   */
  /**
   * Sets the global renderer frame rate (fps).
   *
   * This method is mainly used to improve the performance of js rendering
   * once set, the video data will be sent with this frame rate. This can
   * reduce the CPU consumption of js rendering.
   * This applies to ALL views except the ones added to the high frame rate
   * stream.
   * @param {number} fps The renderer frame rate (fps).
   */
  setVideoRenderFPS(fps: number) {
    this.rtcEngine.setFPS(fps);
  }

  /** @zh-cn
   * 设置高帧率流的渲染帧率。
   *
   * 其中高帧率流指调用 {@link addVideoRenderToHighFPS} 方法添加至高帧率的视频流。
   *
   * @note
   * - 请注意区分高帧率流和双流模式里的大流。
   * - 该方法适用于将大多数视图设置为低帧率，只将一或两路流设置为高帧率的场景，如屏幕共享。
   * @param {number} fps 渲染帧率（fps）
   */
  /**
   * Sets renderer frame rate for the high stream.
   *
   * The high stream here has nothing to do with the dual stream.
   * It means the stream that is added to the high frame rate stream by calling
   * the {@link addVideoRenderToHighFPS} method.
   *
   * This is often used when we want to set the low frame rate for most of
   * views, but high frame rate for one
   * or two special views, e.g. screen sharing.
   * @param {number} fps The renderer high frame rate (fps).
   */
  setVideoRenderHighFPS(fps: number) {
    this.rtcEngine.setHighFPS(fps);
  }

  /** @zh-cn
   * 将指定用户的视频流添加为高帧率流。添加为高帧率流后，你可以调用 {@link setVideoRenderHighFPS} 方法对视频流进行控制。
   * @param {number} uid 用户 ID
   */
  /**
   * Adds a video stream to the high frame rate stream.
   * Streams added to the high frame rate stream will be controlled by the
   * {@link setVideoRenderHighFPS} method.
   * @param {number} uid The User ID.
   */
  addVideoRenderToHighFPS(uid: number) {
    this.rtcEngine.addToHighVideo(uid);
  }

  /** @zh-cn
   * 将指定用户的视频从高帧率流中删除。删除后，你可以调用 {@link setVideoRenderFPS} 方法对视频流进行控制。
   * @param {number} uid 用户 ID
   */
  /**
   * Removes a stream from the high frame rate stream.
   * Streams removed from the high frame rate stream will be controlled by the
   * {@link setVideoRenderFPS} method.
   * @param {number} uid The User ID.
   */
  removeVideoRenderFromHighFPS(uid: number) {
    this.rtcEngine.removeFromHighVideo(uid);
  }

  /** @zh-cn
   * 设置视窗内容显示模式。
   *
   * @param {number | 'local' | 'videosource'} uid 用户 ID，表示设置的是哪个用户的流。设置远端用户的流时，请确保你已先调用 {@link subscribe} 方法订阅该远端用户流。
   * @param {0|1} mode 视窗内容显示模式：
   * - 0：优先保证视窗被填满。视频尺寸等比缩放，直至整个视窗被视频填满。如果视频长宽与显示窗口不同，多出的视频将被截掉
   * - 1： 优先保证视频内容全部显示。视频尺寸等比缩放，直至视频窗口的一边与视窗边框对齐。如果视频长宽与显示窗口不同，视窗上未被填满的区域将被涂黑
   * @returns {number}
   * - 0：方法调用成功
   * - -1：方法调用失败
   */
  /**
   * Sets the view content mode.
   * @param {number | 'local' | 'videosource'} uid The user ID for operating
   * streams. When setting up the view content of the remote user's stream,
   * make sure you have subscribed to that stream by calling the
   * {@link subscribe} method.
   * @param {0|1} mode The view content mode:
   * - 0: Cropped mode. Uniformly scale the video until it fills the visible
   * boundaries (cropped). One dimension of the video may have clipped
   * contents.
   * - 1: Fit mode. Uniformly scale the video until one of its dimension fits
   * the boundary (zoomed to fit). Areas that are not filled due to the
   * disparity
   * in the aspect ratio will be filled with black.
   * @return
   * - 0: Success.
   * - -1: Failure.
   */
  setupViewContentMode(
    uid: number | 'local' | 'videosource',
    mode: 0 | 1,
    channelId: string | undefined
  ): number {
    let channelStreams = this._getChannelRenderers(channelId || "")
    if (channelStreams.has(String(uid))) {
      const renderers = channelStreams.get(String(uid)) || [];
      for(let i = 0; i < renderers.length; i++) {
        let renderer = renderers[i];
        (renderer as IRenderer).setContentMode(mode);
      }
      return 0;
    } else {
      return -1;
    }
  }

  /** @zh-cn
   * 更新 Token。
   *
   * 如果启用了 Token 机制，过一段时间后使用的 Token 会失效。当报告错误码 `109`或 `tokenPrivilegeWillExpire` 回调时，
   * 你应重新获取 Token，然后调用该 API 更新 Token，否则 SDK 无法和服务器建立连接。
   *
   * @param {string} newtoken 新的 Token
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Renews the token when the current token expires.
   *
   * The key expires after a certain period of time once the Token schema is
   * enabled when:
   * - The onError callback reports the ERR_TOKEN_EXPIRED(109) error, or
   * - The requestChannelKey callback reports the ERR_TOKEN_EXPIRED(109) error,
   * or
   * - The user receives the tokenPrivilegeWillExpire callback.
   *
   * The app should retrieve a new token from the server and then call this
   * method to renew it. Failure to do so results in the SDK disconnecting
   * from the server.
   * @param {string} newtoken The new token.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  renewToken(newtoken: string): number {
    return this.rtcEngine.renewToken(newtoken);
  }

  /** @zh-cn
   * 设置频道场景。
   *
   * Agora 会根据你的 app 使用场景进行不同的优化。
   *
   * @note
   * - 该方法必须在 {@link joinChannel} 方法之前调用
   * - 相同频道内的所有用户必须使用相同的频道场景
   *
   * @param {number} profile 频道场景：
   * - `0`：（默认）通信
   * - `1`：直播
   * - `2`：游戏
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Sets the channel profile.
   *
   * The AgoraRtcEngine applies different optimization according to the app
   * scenario.
   *
   * **Note**:
   * -  Call this method before the {@link joinChannel} method.
   * - Users in the same channel must use the same channel profile.
   * @param {number} profile The channel profile:
   * - 0: for communication
   * - 1: for live streaming
   * - 2: for in-game
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setChannelProfile(profile: number): number {
    return this.rtcEngine.setChannelProfile(profile);
  }

  /** @zh-cn
   * 设置直播场景下的用户角色。
   *
   * 加入频道前，用户需要通过本方法设置观众或主播模式。
   *
   * 加入频道后，用户可以通过本方法切换用户模式。直播场景下，如果你在加入频道后调用该方法切换用户角色，
   * 调用成功后，本地会触发 `clientRoleChanged` 事件；远端会触发 `userJoined` 事件。
   *
   * @param {ClientRoleType} role 用户角色：
   * - 1：主播
   * - 2：（默认）观众
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Sets the role of a user (live streaming only).
   *
   * This method sets the role of a user, such as a host or an audience
   * (default), before joining a channel.
   *
   * This method can be used to switch the user role after a user joins a
   * channel. In the `1` (live streaming)profile,
   * when a user switches user roles after joining a channel, a successful
   * {@link setClientRole} method call triggers the following callbacks:
   * - The local client: clientRoleChanged
   * - The remote client: userJoined
   *
   * @param {ClientRoleType} role The client role:
   *
   * - 1: The host
   * - 2: The audience
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setClientRole(role: ClientRoleType): number {
    return this.rtcEngine.setClientRole(role);
  }
  /** 设置直播场景下的用户角色和观众端延时级别。
   *
   * @since v3.2.0
   *
   * 在加入频道前和加入频道后均可调用该方法设置用户角色。
   *
   * 如果你在加入频道后调用该方法成功切换用户角色，SDK 会触发以下回调：
   * - 本地触发 `clientRoleChanged` 回调。
   * - 远端触发 `userJoined` 或 `userOffline` 回调。
   *
   * @note
   * - 该方法仅在频道场景为直播时生效。
   * - 该方法与 {@link setClientRole} 的区别在于，该方法还支持设置用户级别。
   *  - 用户角色确定用户在 SDK 层的权限，包含是否可以发送流、是否可以接收流、是否可以推流到 CDN 等。
   *  - 用户级别需要与角色结合使用，确定用户在其权限范围内，可以操作和享受到的服务级别。
   * 例如对于观众，选择接收低延时还是超低延时的视频流。不同的级别会影响计费。
   *
   * @param role 直播场景中的用户角色。
   * @param options 用户具体设置，包含用户级别。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /** @zh-cn
   * Sets the role of a user in interactive live streaming.
   *
   * @since v3.2.0
   *
   * You can call this method either before or after joining the channel to
   * set the user role as audience or host. If
   * you call this method to switch the user role after joining the channel,
   * the SDK triggers the following callbacks:
   * - The local client: `clientRoleChanged`.
   * - The remote client: `userJoined` or `userOffline`.
   *
   * @note
   * - This method applies to the `LIVE_BROADCASTING` profile only.
   * - The difference between this method and {@link setClientRole} is that
   * this method can set the user level in addition to the user role.
   *  - The user role determines the permissions that the SDK grants to a
   * user, such as permission to send local
   * streams, receive remote streams, and push streams to a CDN address.
   *  - The user level determines the level of services that a user can
   * enjoy within the permissions of the user's
   * role. For example, an audience can choose to receive remote streams with
   * low latency or ultra low latency. Levels
   * affect prices.
   *
   * @param role The role of a user in interactive live streaming.
   * @param options The detailed options of a user, including user level.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setClientRoleWithOptions(role: ClientRoleType, options: ClientRoleOptions): number {
    return this.rtcEngine.setClientRoleWithOptions(role, options);
  }

  /** @zh-cn
   * @deprecated 该方法已废弃。请改用 {@link startEchoTestWithInterval}
   *
   * 开始语音通话回路测试。
   *
   * 该方法启动语音通话测试，目的是测试系统的音频设备（耳麦、扬声器等）和网络连接是否正常。
   * 在测试过程中，用户先说一段话，在 10 秒后，声音会回放出来。如果 10 秒后用户能正常听到自己刚才说的话，
   * 就表示系统音频设备和网络连接都是正常的。
   *
   * @note
   * - 请在加入频道 {@link joinChannel} 前调用该方法
   * - 调用该方法后必须调用 {@link stopEchoTest} 已结束测试，否则不能进行下一次回声测试，也不能调用 {@link joinChannel} 进行通话。
   * - 直播场景下，该方法仅能由用户角色为主播的用户调用
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @deprecated The method is deprecated. Use
   * {@link startEchoTestWithInterval} instead.
   * Starts an audio call test.
   *
   * This method launches an audio call test to determine whether the audio
   * devices (for example, headset and speaker) and the network connection are
   * working properly.
   *
   * To conduct the test, the user speaks, and the recording is played back
   * within 10 seconds.
   *
   * If the user can hear the recording in 10 seconds, it indicates that
   * the audio devices
   * and network connection work properly.
   *
   * **Note**:
   * - Call this method before the {@link joinChannel} method.
   * - After calling this method, call the {@link stopEchoTest} method to end
   * the test. Otherwise, the app cannot run the next echo test,
   * nor can it call the {@link joinChannel} method to start a new call.
   * - In the `1` (live streaming) profile, only hosts can call this method.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  startEchoTest(): number {
    deprecate('startEchoTestWithInterval');
    return this.rtcEngine.startEchoTest();
  }

  /** @zh-cn
   * 停止语音通话回路测试。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Stops the audio call test.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  stopEchoTest(): number {
    return this.rtcEngine.stopEchoTest();
  }

  /** @zh-cn
   * 开始语音通话回路测试。
   *
   * 该方法启动语音通话测试，目的是测试系统的音频设备（耳麦、扬声器等）和网络连接是否正常。
   *
   * 在测试过程中，用户先说一段话，声音会在设置的时间间隔（单位为秒）后回放出来。如果用户能正常听到自己刚才说的话，
   * 就表示系统音频设备和网络连接都是正常的。
   *
   * @note
   * - 请在加入频道 {@link joinChannel} 前调用该方法。
   * - 调用该方法后必须调用 {@link stopEchoTest} 已结束测试，否则不能进行下一次回声测试，也不能调用 {@link joinChannel} 进行通话。
   * - 直播场景下，只有主播能调用该方法。
   * @param interval 设置返回语音通话回路测试结果的时间间隔（s）。取值范围为 [2, 10]，默认为 10。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Starts an audio call test.
   *
   * This method starts an audio call test to determine whether the audio
   * devices
   * (for example, headset and speaker) and the network connection are working
   * properly.
   *
   * In the audio call test, you record your voice. If the recording plays back
   * within the set time interval,
   * the audio devices and the network connection are working properly.
   *
   * **Note**:
   * - Call this method before the {@link joinChannel} method.
   * - After calling this method, call the {@link stopEchoTest} method to end
   * the test. Otherwise, the app cannot run the next echo test,
   * nor can it call the {@link joinChannel} method to start a new call.
   * - In the `1` (live streaming) profile, only hosts can call this method.
   * @param interval The time interval (s) between when you speak and when the
   * recording plays back.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  startEchoTestWithInterval(interval: number): number {
    return this.rtcEngine.startEchoTestWithInterval(interval);
  }
  /** @zh-cn
   * @since v3.0.0
   *
   * 添加本地视频水印。
   *
   * 该方法将一张 PNG 图片作为水印添加到本地发布的直播视频流上，同一直播频道中的观众、
   * 旁路直播观众和录制设备都能看到或采集到该水印图片。Agora 当前只支持在直播视频流中添加一
   * 个水印，后添加的水印会替换掉之前添加的水印。
   *
   * 水印坐标和 {@link setVideoEncoderConfiguration} 中的设置有依赖关系：
   * - 如果视频编码方向固定为横屏或自适应模式下的横屏，那么水印使用横屏坐标。
   * - 如果视频编码方向固定为竖屏或自适应模式下的竖屏，那么水印使用竖屏坐标。
   * - 设置水印坐标时，水印的图像区域不能超出 `setVideoEncoderConfiguration` 方法中设置
   * 的视频尺寸，否则超出部分将被裁剪。
   *
   * @note
   * - 你需要在调用 {@link enableVideo} 后调用该方法。
   * - 如果你只是在旁路直播（推流到CDN）中添加水印，你可以使用本方法或
   * {@link setLiveTranscoding} 设置水印。
   * - 待添加水印图片必须是 PNG 格式。本方法支持所有像素格式的 PNG 图片：RGBA、RGB、Palette、Gray 和 Alpha_gray。
   * - 如果待添加的 PNG 图片的尺寸与你在本方法中设置的尺寸不一致，SDK 会对 PNG 图片进行缩放或裁剪，以与设置相符。
   * - 如果你已经使用 {@link startPreview} 开启本地视频预览，那么本方法的 `visibleInPreview` 可设置水印在预览时是否可见。
   * - 如果你已设置本地视频为镜像模式，那么此处的本地水印也为镜像。为避免本地用户看本地视频时的水印也被镜像，
   * Agora 建议你不要对本地视频同时使用镜像和水印功能，请在应用层实现本地水印功能。
   * @param path 待添加的水印图片的本地路径。本方法支持从本地绝对/相对路径添加水印图片。
   * @param options 待添加的水印图片的设置选项，详见 {@link WatermarkOptions}
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @since v3.0.0
   *
   * Adds a watermark image to the local video.
   *
   * This method adds a PNG watermark image to the local video in a live
   * broadcast. Once the watermark image is added, all the audience in the
   * channel (CDN audience included), and the recording device can see and
   * capture it. Agora supports adding only one watermark image onto the local
   * video, and the newly watermark image replaces the previous one.
   *
   * The watermark position depends on the settings in the
   * {@link setVideoEncoderConfiguration} method:
   * - If the orientation mode of the encoding video is LANDSCAPE, the
   * landscape mode in ADAPTIVE, the watermark uses the landscape orientation.
   * - If the orientation mode of the encoding video is PORTRAIT, or the
   * portrait mode in ADAPTIVE, the watermark uses the portrait orientation.
   * - hen setting the watermark position, the region must be less than the
   * dimensions set in the {@link setVideoEncoderConfiguration} method.
   * Otherwise, the watermark image will be cropped.
   *
   * @note
   * - Ensure that you have called {@link enableVideo} before this method.
   * - If you only want to add a watermark image to the local video for the
   * audience in the CDN live streaming channel to see and capture, you can
   * call this method or {@link setLiveTranscoding}.
   * - This method supports adding a watermark image in the PNG file format
   * only. Supported pixel formats of the PNG image are RGBA, RGB, Palette,
   * Gray, and Alpha_gray.
   * - If the dimensions of the PNG image differ from your settings in this
   * method, the image will be cropped or zoomed to conform to your settings.
   * - If you have enabled the local video preview by calling
   * {@link startPreview}, you can use the `visibleInPreview` member in the
   * WatermarkOptions class to set whether or not the watermark is visible in
   * preview.
   * - If you have enabled the mirror mode for the local video, the watermark
   * on the local video is also mirrored. To avoid mirroring the watermark,
   * Agora recommends that you do not use the mirror and watermark functions
   * for the local video at the same time. You can implement the watermark
   * function in your application layer.
   * @param path The local file path of the watermark image to be added. This
   * method supports adding a watermark image from the local absolute or
   * relative file path.
   * @param options The watermark's options. See {@link WatermarkOptions}
   *
   * @return
   * - 0: Success
   * - < 0: Failure
   */
  addVideoWatermark(path:string, options: WatermarkOptions){
    return this.rtcEngine.addVideoWatermark(path, options)
  }
  /** @zh-cn
   * @since v3.0.0
   *
   * 删除已添加的视频水印。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Removes the watermark image from the video stream added by the
   * {@link addVideoWatermark} method.
   *
   * @return
   * - 0: Success
   * - < 0: Failure
   */
  clearVideoWatermarks(){
    return this.rtcEngine.clearVideoWatermarks();
  }

  /** @zh-cn
   * 启用网络测试。
   *
   * 该方法启用网络连接质量测试，用于检测用户网络接入质量。默认该功能为关闭状态。
   *
   * 该方法主要用于以下两种场景：
   * - 用户加入频道前，可以调用该方法判断和预测目前的上行网络质量是否足够好。
   * - 直播场景下，当用户角色想由观众切换为主播时，可以调用该方法判断和预测目前的上行网络质量是否足够好。
   *
   * @note
   * - 该方法请勿与 {@link startLastmileProbeTest} 方法同时使用。
   * - 调用该方法后，在收到 `lastMileQuality` 回调之前请不要调用其他方法，否则可能会由于
   * API 操作过于频繁导致此回调无法执行。
   * - 启用该方法会消耗一定的网络流量，影响通话质量。在收到 `lastMileQuality` 回调后，
   * 需调用 {@link stopEchoTest} 方法停止测试，再加入频道或切换用户角色。
   * - 直播场景下，主播在加入频道后，请勿调用该方法。
   * - 加入频道前调用该方法检测网络质量后，SDK 会占用一路视频的带宽，码率与
   * {@link setVideoEncoderConfiguration} 中设置的码率相同。加入频道后，无论是否调用了
   * {@link disableLastmileTest}，SDK 均会自动停止带宽占用。
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Enables the network connection quality test.
   *
   * This method tests the quality of the users' network connections and is
   * disabled by default.
   *
   * Before users join a channel or before an audience switches to a host,
   * call this method to check the uplink network quality.
   *
   * This method consumes additional network traffic, which may affect the
   * communication quality.
   *
   * Call the {@link disableLastmileTest} method to disable this test after
   * receiving the lastMileQuality callback, and before the user joins
   * a channel or switches the user role.
   * @note
   * - Do not call any other methods before receiving the
   * lastMileQuality callback. Otherwise,
   * the callback may be interrupted by other methods, and hence may not be
   * triggered.
   * - A host should not call this method after joining a channel
   * (when in a call).
   * - If you call this method to test the last-mile quality, the SDK consumes
   * the bandwidth of a video stream, whose bitrate corresponds to the bitrate
   * you set in the {@link setVideoEncoderConfiguration} method. After you
   * join the channel, whether you have called the {@link disableLastmileTest}
   * method or not, the SDK automatically stops consuming the bandwidth.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  enableLastmileTest(): number {
    return this.rtcEngine.enableLastmileTest();
  }

  /** @zh-cn
   * 关闭网络测试。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * This method disables the network connection quality test.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  disableLastmileTest(): number {
    return this.rtcEngine.disableLastmileTest();
  }

  /** @zh-cn
   * 开始通话前网络质量探测。
   *
   * 启用该方法后，SDK 会向用户反馈上下行网络的带宽、丢包、网络抖动和往返时延数据。SDK 会一次返回如下两个回调：
   * - `lastMileQuality`：视网络情况约 2 秒内返回。该回调通过打分反馈上下行网络质量，更贴近用户的主观感受。
   * - `lastmileProbeResult`：视网络情况约 30 秒内返回。该回调通过客观数据反馈上下行网络质量，因此更客观。
   *
   * 该方法主要用于以下两种场景：
   * - 用户加入频道前，可以调用该方法判断和预测目前的上行网络质量是否足够好。
   * - 直播场景下，当用户角色想由观众切换为主播时，可以调用该方法判断和预测目前的上行网络质量是否足够好。
   *
   * @note
   * - 该方法会消耗一定的网络流量，影响通话质量，因此我们建议不要同时使用该方法和 {@link enableLastmileTest}
   * - 调用该方法后，在收到 `lastMileQuality` 和 `lastmileProbeResult` 回调之前请不用调用其他方法，否则可能会由于 API 操作过于频繁导致此方法无法执行
   * - 直播场景下，如果本地用户为主播，请勿在加入频道后调用该方法
   *
   * @param {LastmileProbeConfig} config last mile 网络探测配置
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Starts the last-mile network probe test before
   * joining a channel to get the uplink and downlink last-mile network
   * statistics,
   * including the bandwidth, packet loss, jitter, and average round-trip
   * time (RTT).
   *
   * Once this method is enabled, the SDK returns the following callbacks:
   * - `lastMileQuality`: the SDK triggers this callback within two
   * seconds depending on the network conditions.
   * This callback rates the network conditions with a score and is more
   * closely linked to the user experience.
   * - `lastmileProbeResult`: the SDK triggers this callback within
   * 30 seconds depending on the network conditions.
   * This callback returns the real-time statistics of the network conditions
   * and is more objective.
   *
   * Call this method to check the uplink network quality before users join
   * a channel or before an audience switches to a host.
   *
   * @note
   * - This method consumes extra network traffic and may affect communication
   * quality. We do not recommend calling this method together with
   * {@link enableLastmileTest}.
   * - Do not call other methods before receiving the lastMileQuality and
   * lastmileProbeResult callbacks. Otherwise, the callbacks may be interrupted
   * by other methods.
   * - In the `1` (live streaming) profile, a host should not call this method after
   * joining a channel.
   *
   * @param {LastmileProbeConfig} config The configurations of the last-mile
   * network probe test. See {@link LastmileProbeConfig}.
   */
  startLastmileProbeTest(config: LastmileProbeConfig): number {
    return this.rtcEngine.startLastmileProbeTest(config);
  }

  /** @zh-cn
   * 停止通话前 last mile 网络质量探测。
   *
   * @return
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Stops the last-mile network probe test.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  stopLastmileProbeTest(): number {
    return this.rtcEngine.stopLastmileProbeTest();
  }

  /** @zh-cn
   * 启用视频模块。
   *
   * 该方法可以在加入频道前或者通话中调用。
   * - 在加入频道前调用，则自动开启视频模式；
   * - 在通话中调用则由音频模式切换为视频模式。
   *
   * 成功调用该方法后，远端会触发 `userEnableVideo(true)` 回调。
   *
   * 若想关闭视频模式，请调用 {@link disableVideo} 方法。
   *
   * @note
   * - 该方法设置的是内部引擎为开启状态，在频道内和频道外均可调用，且在 {@link leaveChannel} 后仍然有效。
   * - 该方法重置整个引擎，响应速度较慢，因此 Agora 建议使用如下方法来控制视频模块：
   *
   *   - {@link enableLocalVideo}：是否启动摄像头采集并创建本地视频流
   *   - {@link muteLocalVideoStream}：是否发布本地视频流
   *   - {@link muteRemoteVideoStream}：是否接收并播放远端视频流
   *   - {@link muteAllRemoteVideoStreams}：是否接收并播放所有远端视频流
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Enables the video module.
   *
   * You can call this method either before joining a channel or during a call.
   * If you call this method before joining a channel,
   * the service starts in the video mode. If you call this method during an
   * audio call, the audio mode switches to the video mode.
   *
   * To disable the video, call the {@link disableVideo} method.
   *
   * **Note**:
   * - This method affects the internal engine and can be called after calling
   * the {@link leaveChannel} method. You can call this method either before
   * or after joining a channel.
   * - This method resets the internal engine and takes some time to take
   * effect. We recommend using the following API methods to control the video
   * engine modules separately:
   *   - {@link enableLocalVideo}: Whether to enable the camera to create the
   * local video stream.
   *   - {@link muteLocalVideoStream}: Whether to publish the local video
   * stream.
   *   - {@link muteLocalVideoStream}: Whether to publish the local video
   * stream.
   *   - {@link muteAllRemoteVideoStreams}: Whether to subscribe to and play
   * all remote video streams.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  enableVideo(): number {
    return this.rtcEngine.enableVideo();
  }

  /** @zh-cn
   * 关闭视频模块。
   *
   * 该方法可以在加入频道前或者通话中调用：
   * - 在加入频道前调用，则自动开启纯音频模式；
   * - 在通话中调用，则由视频模式切换为纯音频频模式。
   *
   * 成功掉调用该方法后，远端会触发 `userEnableVideo(fasle)` 回调。
   *
   * 若想再次开启视频模块，请调用 {@link enableVideo} 方法。
   *
   *
   * @note
   * - 该方法设置的是内部引擎为开启状态，在频道内和频道外均可调用，且在 {@link leaveChannel} 后仍然有效。
   * - 该方法重置整个引擎，响应速度较慢，因此 Agora 建议使用如下方法来控制视频模块：
   *
   *   - {@link enableLocalVideo}：是否启动摄像头采集并创建本地视频流
   *   - {@link muteLocalVideoStream}：是否发布本地视频流
   *   - {@link muteRemoteVideoStream}：是否接收并播放远端视频流
   *   - {@link muteAllRemoteVideoStreams}：是否接收并播放所有远端视频流
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Disables the video module.
   *
   * You can call this method before joining a channel or during a call. If you
   * call this method before joining a channel,
   * the service starts in audio mode. If you call this method during a video
   * call, the video mode switches to the audio mode.
   *
   * To enable the video mode, call the {@link enableVideo} method.
   *
   * **Note**:
   * - This method affects the internal engine and can be called after calling
   * the {@link leaveChannel} method. You can call this method either before
   * or after joining a channel.
   * - This method resets the internal engine and takes some time to take
   * effect. We recommend using the following API methods to control the video
   * engine modules separately:
   *   - {@link enableLocalVideo}: Whether to enable the camera to create the
   * local video stream.
   *   - {@link muteLocalVideoStream}: Whether to publish the local video
   * stream.
   *   - {@link muteLocalVideoStream}: Whether to publish the local video
   * stream.
   *   - {@link muteAllRemoteVideoStreams}: Whether to subscribe to and play
   * all remote video streams.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  disableVideo(): number {
    return this.rtcEngine.disableVideo();
  }

  /** @zh-cn
   * 开启视频预览。
   *
   * 该方法用于在进入频道前启动本地视频预览。调用该 API 前，必须：
   * - 调用 {@link enableVideo} 方法开启视频功能
   * - 调用 {@link setupLocalVideo} 方法设置预览敞口及属性
   *
   * @note
   * - 本地预览默认开启镜像功能
   * - 使用该方法启用了本地视频预览后，如果直接调用 {@link leaveChannel} 退出频道，并不会关闭预览。如需关闭预览，请调用 {@link stopPreview}
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Starts the local video preview before joining a channel.
   *
   * Before starting the preview, always call {@link setupLocalVideo} to set
   * up the preview window and configure the attributes,
   * and also call the {@link enableVideo} method to enable video.
   *
   * If startPreview is called to start the local video preview before
   * calling {@link joinChannel} to join a channel, the local preview
   * remains after after you call {@link leaveChannel} to leave the channel.
   * Call {@link stopPreview} to disable the local preview.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  startPreview(): number {
    return this.rtcEngine.startPreview();
  }

  /** @zh-cn
   * 停止视频预览。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Stops the local video preview and closes the video.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  stopPreview(): number {
    return this.rtcEngine.stopPreview();
  }

  /** @zh-cn
   * @deprecated 该方法已废弃。请改用 {@link setVideoEncoderConfiguration}
   *
   * 设置视频属性。
   *
   * 每个属性对应一套视频参数，如分辨率、帧率、码率等。 当设备的摄像头不支持指定的分辨率时，
   * Agora SDK 会自动选择一个合适的摄像头分辨率，但是编码分辨率仍然用 `setVideoProfile` 指定的。
   *
   * @param {VIDEO_PROFILE_TYPE} profile 视频属性
   * @param {boolean} swapWidthAndHeight 是否交换宽高值：
   * - true：交换
   * - false：不交换（默认）
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @deprecated This method is deprecated. Use
   * {@link setVideoEncoderConfiguration} instead.
   *
   * Sets the video profile.
   *
   * @param {VIDEO_PROFILE_TYPE} profile The video profile. See
   * {@link VIDEO_PROFILE_TYPE}.
   * @param {boolean} [swapWidthAndHeight = false] Whether to swap width and
   * height:
   * - true: Swap the width and height.
   * - false: Do not swap the width and height.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setVideoProfile(
    profile: VIDEO_PROFILE_TYPE,
    swapWidthAndHeight: boolean = false
  ): number {
    return this.rtcEngine.setVideoProfile(profile, swapWidthAndHeight);
  }

  /** @zh-cn
   * 设置摄像头的采集偏好。
   *
   * 一般的视频通话或直播中，默认由 SDK 自动控制摄像头的输出参数。在如下特殊场景中，默认的参数通常无法满足需求，或可能引起设备性能问题，我们推荐调用该接口设置摄像头的采集偏好：
   * - 使用裸数据自采集接口时，如果 SDK 输出的分辨率和帧率高于 {@link setVideoEncoderConfiguration} 中指定的参数，在后续处理视频帧的时候，比如美颜功能时，
   会需要更高的 CPU 及内存，容易导致性能问题。在这种情况下，我们推荐将摄像头采集偏好设置为 `CAPTURER_OUTPUT_PREFERENCE_PERFORMANCE(1)`，避免性能问题。
   * - 如果没有本地预览功能或者对预览质量没有要求，我们推荐将采集偏好设置为 `CAPTURER_OUTPUT_PREFERENCE_PERFORMANCE(1)`，以优化 CPU 和内存的资源分配
   * - 如果用户希望本地预览视频比实际编码发送的视频清晰，可以将采集偏好设置为 `CAPTURER_OUTPUT_PREFERENCE_PREVIEW(2)`
   *
   * @note 请在启动摄像头之前调用该方法，如 {@link joinChannel}、{@link enableVideo} 或者 {@link enableLocalVideo}
   * @param {CameraCapturerConfiguration} config 摄像头采集偏好
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Sets the camera capturer configuration.
   *
   * For a video call or live streaming, generally the SDK controls the camera
   * output parameters.
   * When the default camera capture settings do not meet special requirements
   * or cause performance problems, we recommend using this method to set the
   * camera capture preference:
   * - If the resolution or frame rate of the captured raw video data are
   * higher than those set by {@link setVideoEncoderConfiguration},
   * processing video frames requires extra CPU and RAM usage and degrades
   * performance. We recommend setting config as
   * CAPTURER_OUTPUT_PREFERENCE_PERFORMANCE(1) to avoid such problems.
   * - If you do not need local video preview or are willing to sacrifice
   * preview quality,
   * we recommend setting config as `CAPTURER_OUTPUT_PREFERENCE_PERFORMANCE(1)`
   * to optimize CPU and RAM usage.
   * - If you want better quality for the local video preview, we recommend
   * setting config as CAPTURER_OUTPUT_PREFERENCE_PREVIEW(2).
   * - To customize the width and height of the video image captured by the
   * local camera, set the camera capture configuration as
   * `CAPTURER_OUTPUT_PREFERENCE_MANUAL(3)`.
   *
   * @note Call this method before enabling the local camera. That said,
   * you can call this method before calling {@link joinChannel},
   * {@link enableVideo}, or {@link enableLocalVideo},
   * depending on which method you use to turn on your local camera.
   *
   * @param {CameraCapturerConfiguration} config The camera capturer
   * configuration. See {@link CameraCapturerConfiguration}.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setCameraCapturerConfiguration(config: CameraCapturerConfiguration) {
    return this.rtcEngine.setCameraCapturerConfiguration(config);
  }

  /** @zh-cn
   * 设置视频编码属性。
   *
   * 该方法设置视频编码属性。每个属性对应一套视频参数，如分辨率、帧率、码率、视频方向等。 所有设置的参数均为理想情况下的最大值。当视频引擎因网络环境等原因无法达到设置的分辨率、帧率或码率的最大值时，会取最接近最大值的那个值。
   *
   * 如果用户加入频道后不需要重新设置视频编码属性，则 Agora 建议在 {@link enableVideo} 前调用该方法，可以加快首帧出图的时间。
   *
   * @param {VideoEncoderConfiguration} config 视频编码属性
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Sets the video encoder configuration.
   *
   * Each video encoder configuration corresponds to a set of video parameters,
   * including the resolution, frame rate, bitrate, and video orientation.
   * The parameters specified in this method are the maximum values under ideal
   * network conditions. If the video engine cannot render the video using
   * the specified parameters due to poor network conditions, the parameters
   * further down the list are considered until a successful configuration is
   * found.
   *
   * If you do not set the video encoder configuration after joining the
   * channel, you can call this method before calling the {@link enableVideo}
   * method to reduce the render time of the first video frame.
   * @param {VideoEncoderConfiguration} config The local video encoder
   * configuration. See {@link VideoEncoderConfiguration}.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setVideoEncoderConfiguration(config: VideoEncoderConfiguration): number {
    const {
      width = 640,
      height = 480,
      frameRate = 15,
      minFrameRate = -1,
      bitrate = 0,
      minBitrate = -1,
      orientationMode = 0,
      degradationPreference = 0,
      mirrorMode = 0
    } = config;
    return this.rtcEngine.setVideoEncoderConfiguration({
      width,
      height,
      frameRate,
      minFrameRate,
      bitrate,
      minBitrate,
      orientationMode,
      degradationPreference,
      mirrorMode
    });
  }

  /** @zh-cn
   * 开启或关闭本地美颜功能，并设置美颜效果选项。
   *
   * @since v3.0.0 (适用于 Windows 平台)
   * @since v3.2.0 (适用于 macOS 平台)
   *
   * @note 调用 {@link enableVideo} 之后再调用该方法。
   *
   * @param {boolean} enable 是否开启美颜功能：
   * - `true`：开启
   * - `false`：（默认）关闭
   *
   * @param {Object} options 设置美颜选项，包含如下字段：
   * @param {number} options.lighteningContrastLevel 对比度，与 `lighteningLevel` 搭配使用。取值越大，明暗对比越强烈：
   * - `0` 低对比度
   * - `1` （默认）正常对比度
   * - `2` 高对比度
   * @param {number} options.lighteningLevel 亮度，可用来实现美白等视觉效果。取值范围为 [0.0, 1.0]，其中 0.0 表示原始亮度，默认值为 0.7。
   * @param {number} options.smoothnessLevel 平滑度，可用来实现祛痘、磨皮等视觉效果。取值范围为 [0.0, 1.0]，其中 0.0 表示原始平滑等级，默认值为 0.5。
   * @param {number} options.rednessLevel 红润度，可用来实现红润肤色等视觉效果。取值范围为 [0.0, 1.0]，其中 0.0 表示原始红润度，默认值为 0.1。
   *
   * @return {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Enables/Disables image enhancement and sets the options.
   *
   * @since v3.0.0 for Windows
   * @since v3.2.0 for macOS
   *
   * @note Call this method after calling the {@link enableVideo} method.
   *
   * @param {boolean} enable Sets whether or not to enable image enhancement:
   * - true: Enables image enhancement.
   * - false: Disables image enhancement.
   * @param {Object} options The image enhancement options. It contains the
   * following parameters:
   * @param {number} options.lighteningContrastLevel The contrast
   * level:
   * - `0`: Low contrast level.
   * - `1`: (Default) Normal contrast level.
   * - `2`: High contrast level.
   * @param {number} options.lighteningLevel The brightness level. The value
   * ranges from 0.0 (original) to 1.0.
   * @param {number} options.smoothnessLevel The sharpness level. The value
   * ranges between 0 (original) and 1. This parameter is usually used to
   * remove blemishes.
   * @param {number} options.rednessLevel The redness level. The value ranges
   * between 0 (original) and 1. This parameter adjusts the red saturation
   * level.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setBeautyEffectOptions(
    enable: boolean,
    options: {
      lighteningContrastLevel: 0 | 1 | 2;
      lighteningLevel: number;
      smoothnessLevel: number;
      rednessLevel: number;
    }
  ): number {
    return this.rtcEngine.setBeautyEffectOptions(enable, options);
  }

  /** @zh-cn
   * 设置远端用户媒体流的优先级。
   *
   * 如果将某个远端用户的优先级设为高，那么发给这个用户的音视频流的优先级就会高于其他用户。
   *
   * 该方法可以与 {@link setRemoteSubscribeFallbackOption} 搭配使用。如果开启了订阅流回退选项，弱网下 SDK 会优先保证高优先级用户收到的流的质量。
   *
   * @note
   * - 该方法仅适用于直播场景。
   * - 目前 Agora SDK 仅允许将**一名**远端用户设为高优先级。
   *
   * @param {number} uid 远端用户的 ID
   * @param {Priority} priority 远端用户的需求优先级
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Sets the priority of a remote user's media stream.
   *
   * Use this method with the {@link setRemoteSubscribeFallbackOption} method.
   * If the fallback function is enabled for a subscribed stream, the SDK
   * ensures
   * the high-priority user gets the best possible stream quality.
   *
   * **Note**: The Agora SDK supports setting userPriority as high for one
   * user only.
   * @param {number} uid The ID of the remote user.
   * @param {Priority} priority The priority of the remote user. See {@link Priority}.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setRemoteUserPriority(uid: number, priority: Priority) {
    return this.rtcEngine.setRemoteUserPriority(uid, priority);
  }

  /** @zh-cn
   * 启用音频模块（默认为开启状态）。
   *
   * @note
   * - 该方法设置的是内部引擎为开启状态，在频道内和频道外均可调用，且在 {@link leaveChannel} 后仍然有效。
   * - 该方法重置整个引擎，响应速度较慢，因此 Agora 建议使用如下方法来控制音频模块：
   *
   *   - {@link enableLocalAudio}：是否启动麦克风采集并创建本地音频流
   *   - {@link muteLocalAudioStream}：是否发布本地音频流
   *   - {@link muteRemoteAudioStream}：是否接收并播放远端音频流
   *   - {@link muteAllRemoteAudioStreams}：是否接收并播放所有远端音频流
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Enables the audio module.
   *
   * The audio module is enabled by default.
   *
   * **Note**:
   * - This method affects the internal engine and can be called after calling
   * the {@link leaveChannel} method. You can call this method either before
   * or after joining a channel.
   * - This method resets the internal engine and takes some time to take
   * effect. We recommend using the following API methods to control the
   * audio engine modules separately:
   *   - {@link enableLocalAudio}: Whether to enable the microphone to create
   * the local audio stream.
   *   - {@link muteLocalAudioStream}: Whether to publish the local audio
   * stream.
   *   - {@link muteRemoteAudioStream}: Whether to subscribe to and play the
   * remote audio stream.
   *   - {@link muteAllRemoteAudioStreams}: Whether to subscribe to and play
   * all remote audio streams.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  enableAudio(): number {
    return this.rtcEngine.enableAudio();
  }

  /** @zh-cn
   * 关闭音频模块。
   *
   * @note
   * - 该方法设置的是内部引擎为开启状态，在频道内和频道外均可调用，且在 {@link leaveChannel} 后仍然有效。
   * - 该方法重置整个引擎，响应速度较慢，因此 Agora 建议使用如下方法来控制音频模块：
   *
   *   - {@link enableLocalAudio}：是否启动麦克风采集并创建本地音频流
   *   - {@link muteLocalAudioStream}：是否发布本地音频流
   *   - {@link muteRemoteAudioStream}：是否接收并播放远端音频流
   *   - {@link muteAllRemoteAudioStreams}：是否接收并播放所有远端音频流
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Disables the audio module.
   *
   * **Note**:
   * - This method affects the internal engine and can be called after calling
   * the {@link leaveChannel} method. You can call this method either before
   * or after joining a channel.
   * - This method resets the internal engine and takes some time to take
   * effect. We recommend using the following API methods to control the audio
   * engine modules separately:
   *   - {@link enableLocalAudio}: Whether to enable the microphone to create
   * the local audio stream.
   *   - {@link muteLocalAudioStream}: Whether to publish the local audio
   * stream.
   *   - {@link muteRemoteAudioStream}: Whether to subscribe to and play the
   * remote audio stream.
   *   - {@link muteAllRemoteAudioStreams}: Whether to subscribe to and play
   * all remote audio streams.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  disableAudio(): number {
    return this.rtcEngine.disableAudio();
  }

  /** @zh-cn
   * 设置音频编码配置。
   *
   * @note
   * - 请在 {@link joinChannel} 之前调用该方法，否则不生效。
   * - 通信和直播场景下，音质（码率）会有网络自适应的调整，通过该方法设置的是一个最高码率。
   * - 在有高音质需求的场景（例如音乐教学场景）中，建议将 `profile` 设置为 `4`，`scenario`
   * 设置为 `3`。
   *
   * @param profile 设置采样率、码率、编码模式和声道数：
   * - `0`：默认设置：
   *   - 直播场景：48 KHz 采样率，音乐编码，单声道，编码码率最大值为 52 Kbps
   *   - 通信场景：32 KHz 采样率，音乐编码，单声道，编码码率最大值为 18 Kbps（macOS）；
   * 16 KHz 采样率，音乐编码，单声道，编码码率最大值为 16 Kbps（Windows）
   * - `1`：Speech standard：指定 32 kHz 采样率，语音编码，单声道，编码码率最大值为 18 Kbps
   * - `2`：Music standard：指定 48 kHz 采样率，音乐编码，单声道，编码码率最大值为 48 Kbps
   * - `3`：Music standard stereo：指定 48 kHz采样率，音乐编码，双声道，编码码率最大值为 56 Kbps
   * - `4`：Music high quality：指定 48 kHz 采样率，音乐编码，单声道，编码码率最大值为 128 Kbps
   * - `5`：Music high quality stereo：指定 48 kHz 采样率，音乐编码，双声道，编码码率最大值为 192 Kbps
   * - `6`：IOT。
   * @param scenario 设置音频应用场景：
   * - `0`：默认的音频应用场景
   * - `1`：Chatroom entertainment：娱乐应用，需要频繁上下麦的场景
   * - `2`：Education：教育应用，流畅度和稳定性优先
   * - `3`：Game streaming：游戏直播应用，需要外放游戏音效也直播出去的场景
   * - `4`：Showroom：秀场应用，音质优先和更好的专业外设支持
   * - `5`：Chatroom gaming：游戏开黑
   * - `8`：Meeting：会议场景，适用于人声为主的多人会议。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Sets audio parameters and application scenarios.
   *
   * **Note**:
   * - This method must be called before the {@link joinChannel} method.
   * - In the communication(`0`) and `1` (live streaming) profiles, the bitrate
   * may be different from your settings due to network self-adaptation.
   * - In scenarios requiring high-quality audio, for example, a music
   * teaching scenario, we recommend setting profile
   * as `4` and  scenario as `3`.
   *
   * @param {number} profile Sets the sample rate, bitrate, encoding mode,
   * and the number of channels.
   * - 0: Default audio profile.
   *   - For the `1` (live streaming) profile: A sample rate of 48 KHz, music
   * encoding, mono, and a bitrate of up to 64 Kbps.
   *   - For the communication(`0`) profile:
   *      - macOS: A sample rate of 32 KHz, music encoding, mono, and a
   * bitrate of up to 18 Kbps.
   *      - Windows: A sample rate of 16 KHz, music encoding, mono, and a
   * bitrate of up to 16 Kbps.
   * - 1: Speech standard. A sample rate of 32 kHz, audio encoding, mono, and
   * a bitrate of up to 18 Kbps.
   * - 2: Music standard. A sample rate of 48 kHz, music encoding, mono, and
   * a bitrate of up to 48 Kbps.
   * - 3: Music standard stereo. A sample rate of 48 kHz, music encoding,
   * stereo, and a bitrate of up to 56 Kbps.
   * - 4: Music high quality. A sample rate of 48 kHz, music encoding, mono,
   * and a bitrate of up to 128 Kbps.
   * - 5: Music high quality stereo. A sample rate of 48 kHz, music encoding,
   * stereo, and a bitrate of up to 192 Kbps.
   * - 6: IOT.
   * @param {number} scenario Sets the audio application scenario.
   * - 0: (Default) Standard audio scenario.
   * - 1: Entertainment scenario where users need to frequently switch the
   * user role.
   * - 2: Education scenario where users want smoothness and stability.
   * - 3: High-quality audio chatroom scenario where hosts mainly play music.
   * - 4: Showroom scenario where a single host wants high-quality audio.
   * - 5: Gaming scenario for group chat that only contains the human voice.
   * - 8: Meeting scenario that mainly contains the human voice.
   *
   * Under different audio scenarios, the device uses different volume types.
   * For details, see
   * [What is the difference between the in-call volume and the media volume?](https://docs.agora.io/en/faq/system_volume).
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setAudioProfile(
    profile: 0 | 1 | 2 | 3 | 4 | 5,
    scenario: 0 | 1 | 2 | 3 | 4 | 5 | 8
  ): number {
    return this.rtcEngine.setAudioProfile(profile, scenario);
  }

  /** @zh-cn
   * @deprecated 该方法已废弃。请改用 {@link setCameraCapturerConfiguration} 和 {@link setVideoEncoderConfiguration}
   *
   * 设置视频偏好选项。
   *
   * @note 该方法仅适用于直播场景。
   * @param {boolean} preferFrameRateOverImageQuality 视频偏好选项：
   * - true：视频画质和流畅度里，优先保证流畅度
   * - false：视频画质和流畅度里，优先保证画质（默认）
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @deprecated This method is deprecated. Use
   * {@link setCameraCapturerConfiguration} and
   * {@link setVideoEncoderConfiguration} instead.
   * Sets the preference option for the video quality (live streaming only).
   * @param {boolean} preferFrameRateOverImageQuality Sets the video quality
   * preference:
   * - true: Frame rate over image quality.
   * - false: (Default) Image quality over frame rate.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setVideoQualityParameters(preferFrameRateOverImageQuality: boolean): number {
    return this.rtcEngine.setVideoQualityParameters(
      preferFrameRateOverImageQuality
    );
  }

  /** @zh-cn
   * @deprecated 该方法自 v3.2.0 起废弃。请改用 {@link enableEncryption} 方法。
   *
   * 启用内置加密，并设置数据加密密码。
   *
   * 如需启用加密，请在 {@link joinChannel} 前调用该方法，并设置加密的密码。
   * 同一频道内的所有用户应设置相同的密码。当用户离开频道时，该频道的密码会自动清除。如果未指定密码或将密码设置为空，则无法激活加密功能。
   *
   * @note 为保证最佳传输效果，请确保加密后的数据大小不超过原始数据大小 + 16 字节。16 字节是 AES 通用加密模式下最大填充块大小。
   *
   * @param {string} secret 加密密码
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @deprecated This method is deprecated from v3.2.0. Use the
   * {@link enableEncryption} method instead.
   *
   * Enables built-in encryption with an encryption password before joining
   * a channel.
   *
   * All users in a channel must set the same encryption password.
   * The encryption password is automatically cleared once a user has left
   * the channel.
   * If the encryption password is not specified or set to empty, the
   * encryption function will be disabled.
   *
   * **Note**:
   * - For optimal transmission, ensure that the encrypted data size does not
   * exceed the original data size + 16 bytes. 16 bytes is the maximum padding
   * size for AES encryption.
   * - Do not use this method for CDN live streaming.
   * @param {string} secret Encryption Password
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setEncryptionSecret(secret: string): number {
    return this.rtcEngine.setEncryptionSecret(secret);
  }
  /** @zh-cn
   * 设置内置的加密方案。
   *
   * @depercated 该方法自 v3.2.0 起废弃。请改用 {@link enableEncryption} 方法。
   *
   * Agora Native SDK 支持内置加密功能，默认使用 AES-128-XTS 加密方式。如需使用其他加密方式，可以调用该 API 设置。
   *
   * 同一频道内的所有用户必须设置相同的加密方式和密码才能进行通话。关于这几种加密方式的区别，请参考 AES 加密算法的相关资料。
   *
   * @note 调用本方法前，请先调用 {@link setEncryptionSecret} 方法启用内置加密功能。
   *
   * @param mode 加密方式。目前支持以下几种：
   * - "aes-128-xts"：128 位 AES 加密，XTS 模式
   * - "aes-128-ecb"：128 位 AES 加密，ECB 模式
   * - "aes-256-xts"：256 位 AES 加密，XTS 模式
   * - ""：设置为空字符串时，默认使用加密方式 aes-128-xts
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Sets the built-in encryption mode.
   *
   * @depercated This method is deprecated from v3.2.0. Use
   * the {@link enableEncryption} method instead.
   *
   * The Agora SDK supports built-in encryption, which is set to aes-128-xts
   * mode by default.
   * Call this method to set the encryption mode to use other encryption modes.
   * All users in the same channel must use the same encryption mode and
   * password.
   *
   * Refer to the information related to the AES encryption algorithm on the
   * differences between the encryption modes.
   *
   * **Note**: Call the {@link setEncryptionSecret} method before calling
   * this method.
   * @param mode Sets the encryption mode:
   * - "aes-128-xts": 128-bit AES encryption, XTS mode.
   * - "aes-128-ecb": 128-bit AES encryption, ECB mode.
   * - "aes-256-xts": 256-bit AES encryption, XTS mode.
   * - "": When encryptionMode is set as null, the encryption is in
   * “aes-128-xts” by default.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setEncryptionMode(mode: string): number {
    return this.rtcEngine.setEncryptionMode(mode);
  }

  /** @zh-cn
   * 停止/恢复发送本地音频流。
   *
   * 成功调用该方法后，远端会触发 `userMuteAudio` 回调。
   *
   * @note 我们建议你在 {@link setChannelProfile} 后调用该方法。因为如果你在该方法后调用 `setChannelProfile`方法，
   * SDK 会根据你设置的频道场景以及用户角色，重新设置是否停止发送本地音频。
   *
   *
   * @param {boolean} mute
   * - true：停止发送本地音频流
   * - false：继续发送本地音频流（默认）
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Stops or resumes publishing the local audio stream.
   *
   * A successful {@link muteLocalAudioStream} method call
   * triggers the `userMuteAudio` callback on the remote client.
   *
   * @note
   * - When @p mute is set as @p true, this method does not affect any ongoing
   * audio recording, because it does not disable the microphone.
   * - You can call this method either before or after joining a channel. If
   * you call {@link setChannelProfile}
   * after this method, the SDK resets whether or not to stop publishing the
   * local audio according to the channel profile and user role.
   * Therefore, we recommend calling this method after the `setChannelProfile`
   * method.
   *
   * @param mute Sets whether to stop publishing the local audio stream.
   * - true: Stop publishing the local audio stream.
   * - false: (Default) Resumes publishing the local audio stream.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  muteLocalAudioStream(mute: boolean): number {
    return this.rtcEngine.muteLocalAudioStream(mute);
  }

  /** @zh-cn
   * 停止/恢复接收所有音频流。
   *
   * @param {boolean} mute
   * - true：停止接收所有音频流
   * - false：继续接收所有音频流（默认）
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Stops or resumes subscribing to the audio streams of all remote users.
   *
   * As of v3.3.1, after successfully calling this method, the local user
   * stops or resumes
   * subscribing to the audio streams of all remote users, including all
   * subsequent users.
   *
   * @note
   * - Call this method after joining a channel.
   * - See recommended settings in *Set the Subscribing State*.
   *
   * @param mute Sets whether to stop subscribing to the audio streams of
   * all remote users.
   * - true: Stop subscribing to the audio streams of all remote users.
   * - false: (Default) Resume subscribing to the audio streams of all
   * remote users.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  muteAllRemoteAudioStreams(mute: boolean): number {
    return this.rtcEngine.muteAllRemoteAudioStreams(mute);
  }

  /** @zh-cn
   * 设置是否默认接收音频流。
   *
   * 该方法在加入频道前后都可调用。如果在加入频道后调用 `setDefaultMuteAllRemoteAudioStreams (true)`，会接收不到后面加入频道的用户的音频流。
   *
   * @note 停止接收音频流后，如果想要恢复接收，请调用 {@link muteRemoteAudioStream}(false)，并指定你想要接收的远端用户 uid；
   * 如果想恢复接收多个用户的音频流，则需要多次调用 {@link muteRemoteAudioStream}(false)。`setDefaultMuteAllRemoteAudioStreams (false)` 只能恢复接收后面加入频道的用户的音频流。
   * @param {boolean} mute
   * - true：默认不接收所有音频流
   * - false：默认接收所有音频流（默认）
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Stops or resumes subscribing to the audio streams of all remote users
   * by default.
   *
   * @deprecated This method is deprecated from v3.3.1.
   *
   *
   * Call this method after joining a channel. After successfully calling this
   * method, the
   * local user stops or resumes subscribing to the audio streams of all
   * subsequent users.
   *
   * @note If you need to resume subscribing to the audio streams of remote
   * users in the
   * channel after calling {@link setDefaultMuteAllRemoteAudioStreams}(true),
   * do the following:
   * - If you need to resume subscribing to the audio stream of a specified
   * user, call {@link muteRemoteAudioStream}(false), and specify the user ID.
   * - If you need to resume subscribing to the audio streams of multiple
   * remote users, call {@link muteRemoteAudioStream}(false) multiple times.
   *
   * @param mute Sets whether to stop subscribing to the audio streams of all
   * remote users by default.
   * - true: Stop subscribing to the audio streams of all remote users by
   * default.
   * - false: (Default) Resume subscribing to the audio streams of all remote
   * users by default.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setDefaultMuteAllRemoteAudioStreams(mute: boolean): number {
    return this.rtcEngine.setDefaultMuteAllRemoteAudioStreams(mute);
  }

  /** @zh-cn
   * 停止/恢复接收指定音频流。
   *
   * 如果之前有调用过 {@link muteAllRemoteAudioStreams}(true) 停止订阅所有远端
   * 音频，在调用 `muteRemoteAudioStreams` 之前请确保你已调用 {@link muteAllRemoteAudioStreams}(false)。
   *
   * `muteAllRemoteAudioStreams` 是全局控制，`muteRemoteAudioStream` 是精细控制。
   *
   * @param {number} uid 指定的用户 ID
   * @param {boolean} mute
   * - `true`：停止接收指定用户的音频流
   * - `false`：继续接收指定用户的音频流
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Stops or resumes subscribing to the audio stream of a specified user.
   *
   * @note
   * - Call this method after joining a channel.
   * - See recommended settings in *Set the Subscribing State*.
   *
   * @param userId The user ID of the specified remote user.
   * @param mute Sets whether to stop subscribing to the audio stream of a
   * specified user.
   * - true: Stop subscribing to the audio stream of a specified user.
   * - false: (Default) Resume subscribing to the audio stream of a specified
   * user.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  muteRemoteAudioStream(uid: number, mute: boolean): number {
    return this.rtcEngine.muteRemoteAudioStream(uid, mute);
  }

  /** @zh-cn
   * 停止/恢复发送本地视频流。
   *
   * 成功调用该方法后，远端会触发 `userMuteVideo` 回调。
   *
   * @note
   * - 调用该方法时，SDK 不再发送本地视频流，但摄像头仍然处于工作状态。
   * - 我们建议你在 {@link setChannelProfile} 后调用该方法。因为如果你在该方法后调用 `setChannelProfile`方法，
   * SDK 会根据你设置的频道场景以及用户角色，重新设置是否停止发送本地视频。
   *
   * @param {boolean} mute
   * - `true`：停止发送本地视频流
   * - `false`：发动本地视频流（默认）
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /** Stops or resumes publishing the local video stream.
   *
   * A successful {@link muteLocalVideoStream} method call
   * triggers the `userMuteVideo` callback on
   * the remote client.
   *
   * @note
   * - This method executes faster than the {@link enableLocalVideo} method,
   * which controls the sending of the local video stream.
   * - When `mute` is set as `true`, this method does not affect any ongoing
   * video recording, because it does not disable the camera.
   * - You can call this method either before or after joining a channel.
   * If you call {@link setChannelProfile}
   * after this method, the SDK resets whether or not to stop publishing the
   * local video according to the channel profile and user role.
   * Therefore, Agora recommends calling this method after the
   * `setChannelProfile` method.
   *
   * @param mute Sets whether to stop publishing the local video stream.
   * - true: Stop publishing the local video stream.
   * - false: (Default) Resumes publishing the local video stream.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  muteLocalVideoStream(mute: boolean): number {
    return this.rtcEngine.muteLocalVideoStream(mute);
  }

  /** @zh-cn
   * 开/关本地视频采集。
   *
   * 该方法禁用或重新启用本地视频采集，不影响接收远端视频。
   *
   * 调用 {@link enableVideo} 后，本地视频即默认开启。你可以调用
   * enableLocalVideo(false) 关闭本地视频采集。关闭后如果想要重新开启，则可调用
   * enableLocalVideo(true)。
   *
   * 成功禁用或启用本地视频采集后，远端会触发 userEnableLocalVideo 回调。
   *
   * @param {boolean} enable
   * - true：开启本地视频采集和渲染（默认）
   * - false：关闭本地视频采集和渲染。关闭后，远端用户会接收不到本地用户的视频流；但本地用户依然可以接收远端用户的视频流
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Disables/Re-enables the local video capture.
   *
   * This method disables or re-enables the local video capturer, and does not
   * affect receiving the remote video stream.
   *
   * After you call the {@link enableVideo} method, the local video capturer
   * is enabled
   * by default. You can call enableLocalVideo(false) to disable the local
   * video capturer. If you want to re-enable it, call enableLocalVideo(true).
   *
   * After the local video capturer is successfully disabled or re-enabled,
   * the SDK triggers the userEnableVideo callback on the remote client.
   *
   * @param {boolean} enable Sets whether to disable/re-enable the local video,
   * including the capturer, renderer, and sender:
   * - true: (Default) Re-enable the local video.
   * - false: Disable the local video. Once the local video is disabled, the
   * remote users can no longer receive the video stream of this user,
   * while this user can still receive the video streams of other remote users.
   * When you set enabled as false, this method does not require a local
   * camera.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  enableLocalVideo(enable: boolean): number {
    return this.rtcEngine.enableLocalVideo(enable);
  }

  /** @zh-cn
   * 开/关本地音频采集。
   *
   * 当 App 加入频道时，它的语音功能默认是开启的。该方法可以关闭或重新开启本地语音功能，即停止或重新开始本地音频采集。
   *
   * 该方法不影响接收或播放远端音频流，`enableLocalAudio(false)` 适用于只听不发的用户场景。语音功能关闭或重新开启后，会收到回调 `microphoneEnabled`。
   *
   * @note 该方法与 {@link muteLocalAudioStream} 的区别在于：
   *  - `enableLocalAudio`: 使用 `enableLocalAudio` 关闭或开启本地采集后，本地听远端播放会有短暂中断。
   *  - `muteLocalAudioStream`: 使用 `muteLocalAudioStream` 停止或继续发送本地音频流后，本地听远端播放不会有短暂中断。
   *
   * @param {boolean} enable
   * - true：开启本地音频采集（默认）
   * - false：关闭本地音频采集
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Enables/Disables the local audio capture.
   *
   * The audio function is enabled by default. This method disables/re-enables
   * the local audio function, that is, to stop or restart local audio capture
   * and processing.
   *
   * This method does not affect receiving or playing the remote audio streams,
   * and enableLocalAudio(false) is applicable to scenarios where the user
   * wants to receive remote
   * audio streams without sending any audio stream to other users in the
   * channel.
   *
   * The SDK triggers the microphoneEnabled callback once the local audio
   * function is disabled or re-enabled.
   *
   * @param {boolean} enable Sets whether to disable/re-enable the local audio
   * function:
   * - true: (Default) Re-enable the local audio function, that is, to start
   * local audio capture and processing.
   * - false: Disable the local audio function, that is, to stop local audio
   * capture and processing.
   *
   * @note This method is different from the {@link muteLocalAudioStream}
   * method:
   *  - enableLocalAudio: If you disable or re-enable local audio recording
   * using the enableLocalAudio method, the local user may hear a pause in the
   * remote audio playback.
   *  - {@link }muteLocalAudioStream: Stops/Continues sending the local audio
   * streams and the local user will not hear a pause in the remote audio
   * playback.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  enableLocalAudio(enable: boolean): number {
    return this.rtcEngine.enableLocalAudio(enable);
  }

  /** @zh-cn
   * 停止/恢复接收所有视频流。
   *
   * @param {boolean} mute
   * - true：停止接收所有视频流
   * - false：继续接收所有视频流（默认）
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Stops or resumes subscribing to the video streams of all remote users.
   *
   * As of v3.3.1, after successfully calling this method, the local user
   * stops or resumes
   * subscribing to the video streams of all remote users, including all
   * subsequent users.
   *
   * @note
   * - Call this method after joining a channel.
   * - See recommended settings in *Set the Subscribing State*.
   *
   * @param mute Sets whether to stop subscribing to the video streams of
   * all remote users.
   * - true: Stop subscribing to the video streams of all remote users.
   * - false: (Default) Resume subscribing to the video streams of all remote
   * users.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  muteAllRemoteVideoStreams(mute: boolean): number {
    return this.rtcEngine.muteAllRemoteVideoStreams(mute);
  }

  /** @zh-cn
   * 设置是否默认接收视频流。
   *
   * 该方法在加入频道前后都可调用。如果在加入频道后调用 `setDefaultMuteAllRemoteVideoStreams (true)`，会接收不到设置后加入频道的用户的视频流。
   *
   * @note 停止接收视频流后，如果想要恢复接收，请调用 {@link muteRemoteVideoStream}(false)，
   * 并指定你想要接收的远端用户 uid；如果想恢复接收多个用户的视频流，则需要多次调用 {@link muteRemoteVideoStream}(false)。
   * `setDefaultMuteAllRemoteVideoStreams (false)` 只能恢复接收后面加入频道的用户的视频流。
   * @param {boolean} mute
   * - true：默认不接收任何视频流
   * - false：默认继续接收所有视频流（默认）
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /** Stops or resumes subscribing to the video streams of all remote users
   * by default.
   *
   * @deprecated This method is deprecated from v3.3.1.
   *
   * Call this method after joining a channel. After successfully calling
   * this method, the
   * local user stops or resumes subscribing to the video streams of all
   * subsequent users.
   *
   * @note If you need to resume subscribing to the video streams of remote
   * users in the
   * channel after calling {@link setDefaultMuteAllRemoteVideoStreams}(true),
   * do the following:
   * - If you need to resume subscribing to the video stream of a specified
   * user, call {@link muteRemoteVideoStream}(false), and specify the user ID.
   * - If you need to resume subscribing to the video streams of multiple
   * remote users, call {@link muteRemoteVideoStream}(false) multiple times.
   *
   * @param mute Sets whether to stop subscribing to the video streams of all
   * remote users by default.
   * - true: Stop subscribing to the video streams of all remote users by
   * default.
   * - false: (Default) Resume subscribing to the video streams of all remote
   * users by default.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setDefaultMuteAllRemoteVideoStreams(mute: boolean): number {
    return this.rtcEngine.setDefaultMuteAllRemoteVideoStreams(mute);
  }

  /** @zh-cn
   * 启用说话者音量提示。
   *
   * 该方法允许 SDK 定期向 App 反馈当前谁在说话以及说话者的音量。启用该方法后，无论频道内是否有人说话，
   * 都会在说话声音音量提示回调 `groupAudioVolumeIndication` 回调中按设置的间隔时间返回音量提示。
   *
   * @param {number} interval 指定音量提示的时间间隔：
   * - ≤ 0: 不启用音量提示功能
   * - &gt; 0: 返回音量提示的间隔，单位为毫秒。建议设置到大于 200 毫秒。最小不得少于 10 毫秒，否则会收不到 `groupAudioVolumeIndication` 回调。
   * @param {number} smooth 平滑系数，指定音量提示的灵敏度。取值范围为 [0, 10]。建议值为 3，数字越大，波动越灵敏；数字越小，波动越平滑
   * @param report_vad
   * - `true`: 开启本地人声检测功能。开启后，`groupAudioVolumeIndication` 回调的 `vad` 参数会报告是否在本地检测到人声。
   * - `false`:（默认）关闭本地人声检测功能。除引擎自动进行本地人声检测的场景外，`groupAudioVolumeIndication` 回调的 `vad` 参数不会报告是否在本地检测到人声。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Enables the `groupAudioVolumeIndication` callback at a set time interval to
   * report on which users are speaking and the speakers' volume.
   *
   * Once this method is enabled, the SDK returns the volume indication in the
   * groupAudioVolumeIndication callback at the set time interval,
   * regardless of whether any user is speaking in the channel.
   *
   * @param {number} interval Sets the time interval between two consecutive
   * volume indications:
   * - ≤ 0: Disables the volume indication.
   * - &gt; 0: Time interval (ms) between two consecutive volume indications.
   * We recommend setting interval &ge; 200 ms.
   * @param {number} smooth The smoothing factor sets the sensitivity of the
   * audio volume indicator. The value ranges between 0 and 10.
   * The greater the value, the more sensitive the indicator. The recommended
   * value is 3.
   * @param {boolean} report_vad
   * - `true`: Enable the voice activity detection of the local user. Once it is
   * enabled, `vad` in the `groupAudioVolumeIndication` callback reports
   * the voice activity status of the local user.
   * - `false`: (Default) Disables the voice activity detection of the local user.
   * Once it is disabled, `vad` in the `groupAudioVolumeIndication` callback
   * does not report the voice activity status of the local
   * user, except for scenarios where the engine automatically detects
   * the voice activity of the local user.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  enableAudioVolumeIndication(interval: number, smooth: number, report_vad: boolean = false): number {
    return this.rtcEngine.enableAudioVolumeIndication(interval, smooth, report_vad);
  }

  /** @zh-cn
   * 停止/恢复接收指定视频流。
   *
   * 如果之前有调用过 {@link muteAllRemoteVideoStreams}(true) 停止订阅所有远端
   * 视频，在调用 `muteRemoteVideoStreams` 之前请确保你已调用 {@link muteAllRemoteVideoStreams}(false)。
   *
   * `muteAllRemoteVideoStreams` 是全局控制，`muteRemoteVideoStream` 是精细控制。
   *
   * @param {number} uid 指定用户的 ID
   * @param {boolean} mute
   * - true：停止接收指定用户的视频流
   * - false：继续接收指定用户的视频流（默认）
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Stops or resumes subscribing to the video stream of a specified user.
   *
   * @note
   * - Call this method after joining a channel.
   * - See recommended settings in *Set the Subscribing State*.
   *
   * @param userId The user ID of the specified remote user.
   * @param mute Sets whether to stop subscribing to the video stream of a
   * specified user.
   * - true: Stop subscribing to the video stream of a specified user.
   * - false: (Default) Resume subscribing to the video stream of a specified
   * user.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  muteRemoteVideoStream(uid: number, mute: boolean): number {
    return this.rtcEngine.muteRemoteVideoStream(uid, mute);
  }

  /** @zh-cn
   * 设置耳返音量。
   *
   * @param {number} volume 耳返的音量，取值范围为 [0, 100]，默认值为 100
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */

  /** @zh-cn
   * @deprecated 该方法已废弃。请改用 {@link disableAudio}
   * 禁用频道内的音频功能。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @deprecated This method is deprecated. Use {@link disableAudio} instead.
   * Disables the audio function in the channel.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  pauseAudio() {
    deprecate('disableAudio');
    return this.rtcEngine.pauseAudio();
  }

  /** @zh-cn
   * @deprecated 该方法已弃用。请改用 {@link enableAudio}
   * 启用频道内的音频功能。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @deprecated  This method is deprecated. Use {@link enableAudio} instead.
   * Resumes the audio function in the channel.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  resumeAudio() {
    deprecate('enableAudio');
    return this.rtcEngine.resumeAudio();
  }

  /** @zh-cn
   * 设置日志文件。
   *
   * 设置 SDK 的输出 log 文件。SDK 运行时产生的所有 log 将写入该文件。你的 app 必须保证指定的目录存在而且可写。
   *
   * @note 如需调用本方法，请在调用 {@link initialize} 方法初始化 `AgoraRtcEngine` 对象后立即调用，否则可能造成输出日志不完整。
   *
   * @param {string} filepath 日志文件的完整路径
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Specifies an SDK output log file.
   *
   * @deprecated This method is deprecated from v3.3.1. Use `logConfig` in
   * the {@link initialize} method instead.
   *
   * @param {string} filepath File path of the log file. The string of the
   * log file is in UTF-8.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setLogFile(filepath: string): number {
    return this.rtcEngine.setLogFile(filepath);
  }

  /** @zh-cn
   * 设置 Agora SDK 输出的单个日志文件大小。
   *
   * 默认情况下，SDK 会生成 `agorasdk.log`、`agorasdk_1.log`、`agorasdk_2.log`、
   * `agorasdk_3.log`、`agorasdk_4.log` 这 5 个日志文件。
   * 每个文件的默认大小为 1024 KB。日志文件为 UTF-8 编码。最新的日志永远写在
   * `agorasdk.log` 中。`agorasdk.log` 写满后，SDK 会从 1-4 中删除修改时间最早的一个文件，
   * 然后将 `agorasdk.log` 重命名为该文件，并建立新的 `agorasdk.log` 写入最新的日志。
   *
   * @note 如果想要设置日志文件的大小，则需要在 {@link setLogFile} 前调用本方法，否则日志会被清空。
   *
   * 相关 API：
   * - {@link setLogFile}
   * - {@link setLogFilter}
   *
   * @param size 单个日志文件的大小，单位为 KB。默认值为 1024 KB。
   * 如果你将 `size` 设为 1024 KB，SDK 会最多输出 5 MB 的日志文件。如果你将 `size` 设为
   * 小于 1024 KB，单个日志文件最大仍为 1024 KB。
   *
   * @return
   * - 0: 方法调用成功
   * - < 0: 方法调用失败
   */
  /** Sets the size of a log file that the SDK outputs.
   *
   * @deprecated This method is deprecated from v3.3.1. Use `logConfig` in
   * the {@link initialize} method instead.
   *
   * @note If you want to set the log file size, ensure that you call
   * this method before {@link setLogFile}, or the logs are cleared.
   *
   * By default, the SDK outputs five log files, `agorasdk.log`,
   * `agorasdk_1.log`, `agorasdk_2.log`, `agorasdk_3.log`, `agorasdk_4.log`,
   * each with a default size of 1024 KB.
   * These log files are encoded in UTF-8. The SDK writes the latest logs in
   * `agorasdk.log`. When `agorasdk.log` is full, the SDK deletes the log
   * file with the earliest
   * modification time among the other four, renames `agorasdk.log` to the
   * name of the deleted log file, and create a new `agorasdk.log` to record
   * latest logs.
   *
   * Related APIs:
   * - {@link setLogFile}
   * - {@link setLogFilter}
   *
   * @param size The size (KB) of a log file. The default value is 1024 KB.
   * If you set `size` to 1024 KB,
   * the SDK outputs at most 5 MB log files; if you set it to less than
   * 1024 KB, the maximum size of a log file is still 1024 KB.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setLogFileSize(size: number): number {
    return this.rtcEngine.setLogFileSize(size);
  }

  /** @zh-cn
   * 双实例方法：设置屏幕共享对象的日志。
   *
   * @note 请在初始化 `videoSource` 后调用。
   * @param {string} filepath 日志文件的完整路径
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Specifies an SDK output log file for the video source object.
   *
   * **Note**: Call this method after the {@link videoSourceInitialize} method.
   * @param {string} filepath filepath of log. The string of the log file is
   * in UTF-8.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  videoSourceSetLogFile(filepath: string) {
    return this.rtcEngine.videoSourceSetLogFile(filepath);
  }

  /** @zh-cn
   * 设置日志文件过滤器。
   *
   * 该方法设置 SDK 的输出日志过滤等级。不同的过滤等级可以单独或组合使用。
   *
   * 日志级别顺序依次为 OFF、CRITICAL、ERROR、WARNING、INFO 和 DEBUG。选择一个级别，你就可以看到在该级别之前所有级别的日志信息。
   * 例如，你选择 WARNING 级别，就可以看到在 CRITICAL、ERROR 和 WARNING 级别上的所有日志信息。
   * @param {number} filter 设置过滤器等级
   * - `0`：不输出任何日志
   * - `0x080f`：输出所有的 API 日志，即CRITICAL、ERROR、WARNING、INFO 和 DEBUG 级别的日志。如果你想获取最完整的日志，可将日志级别设为该等级
   * - `0x000f`：输出 CRITICAL、ERROR、WARNING、INFO 级别的日志。我们推荐你将日志级别设为该等级
   * - `0x000e`：仅输出 CRITICAL、ERROR、WARNING 级别的日志
   * - `0x000c`：仅输出 CRITICAL、ERROR 级别的日志
   * - `0x0008`：仅输出 CRITICAL 级别的日志
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Sets the output log level of the SDK.
   *
   * @deprecated This method is deprecated from v3.3.1. Use `logConfig` in
   * the {@link initialize} method instead.
   *
   * You can use one or a combination of the filters. The log level follows
   * the sequence of OFF, CRITICAL, ERROR, WARNING, INFO, and DEBUG.
   * Choose a level to see the logs preceding that level. For example, if you
   * set the log level to WARNING, you see the logs within levels CRITICAL,
   * ERROR, and WARNING.
   * @param {number} filter Sets the filter level:
   * - `0`: Do not output any log.
   * - `0x080f`: Output all the API logs. Set your log filter
   * as DEBUG if you want to get the most complete log file.
   * - `0x000f`: Output logs of the CRITICAL, ERROR, WARNING and
   * INFO level. We recommend setting your log filter as this level.
   * - `0x000e`: Output logs of the CRITICAL, ERROR and
   * WARNING level.
   * - `0x000c`: Output logs of the CRITICAL and ERROR level.
   * - `0x0008`: Output logs of the CRITICAL level.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setLogFilter(filter: number): number {
    return this.rtcEngine.setLogFilter(filter);
  }

  /** @zh-cn
   * 开/关视频双流模式。
   *
   * 该方法设置单流（默认）或者双流模式。发送端开启双流模式后，接收端可以选择接收大流还是小流。
   *
   * 其中，大流指高分辨率、高码率的视频流，小流指低分辨率、低码率的视频流。
   *
   * @param {boolean} enable 指定双流或者单流模式：
   * - true：开启双流
   * - false：不开启双流（默认）
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Enables/Disables the dual video stream mode.
   *
   * If dual-stream mode is enabled, the receiver can choose to receive the
   * high stream (high-resolution high-bitrate video stream)
   * or low stream (low-resolution low-bitrate video stream) video.
   * @param {boolean} enable Sets the stream mode:
   * - true: Dual-stream mode.
   * - false: (Default) Single-stream mode.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  enableDualStreamMode(enable: boolean): number {
    return this.rtcEngine.enableDualStreamMode(enable);
  }

  /** @zh-cn
   * 设置订阅的视频流类型。
   *
   * 在网络条件受限的情况下，如果发送端没有调用 {@link enableDualStreamMode}(false) 关闭双流模式，
   * 接收端可以选择接收大流还是小流。其中，大流可以接为高分辨率高码率的视频流，小流则是低分辨率低码率的视频流。
   *
   * 正常情况下，用户默认接收大流。如需接收小流，可以调用本方法进行切换。SDK 会根据视频窗口的大小动态调整对应视频流的大小，以节约带宽和计算资源。
   *
   * 视频小流默认的宽高比和视频大流的宽高比一致。根据当前大流的宽高比，系统会自动分配小流的分辨率、帧率及码率。
   *
   * 调用本方法的执行结果将在 `apiCallExecuted` 中返回。
   * @param {number} uid 用户 ID
   * @param {StreamType} streamType 视频流类型
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Sets the stream type of the remote video.
   *
   * Under limited network conditions, if the publisher has not disabled the
   * dual-stream mode using {@link enableDualStreamMode}(false), the receiver
   * can choose to receive either the high-video stream (the high resolution,
   * and high bitrate video stream) or the low-video stream (the low
   * resolution, and low bitrate video stream).
   *
   * By default, users receive the high-video stream. Call this method if you
   * want to switch to the low-video stream. This method allows the app to
   * adjust the corresponding video stream type based on the size of the video
   * window to reduce the bandwidth and resources.
   *
   * The aspect ratio of the low-video stream is the same as the high-video
   * stream. Once the resolution of the high-video stream is set, the system
   * automatically sets the resolution, frame rate, and bitrate of the
   * low-video stream.
   * The SDK reports the result of calling this method in the
   * `apiCallExecuted` callback.
   * @param {number} uid ID of the remote user sending the video stream.
   * @param {StreamType} streamType Sets the video stream type:
   * - 0: High-stream video, the high-resolution, high-bitrate video.
   * - 1: Low-stream video, the low-resolution, low-bitrate video.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setRemoteVideoStreamType(uid: number, streamType: StreamType): number {
    return this.rtcEngine.setRemoteVideoStreamType(uid, streamType);
  }

  /** @zh-cn
   * 设置默认订阅的视频流类型。
   *
   * 在网络条件受限的情况下，如果发送端没有调用 {@link enableDualStreamMode}(false) 关闭双流模式，
   * 接收端可以选择接收大流还是小流。其中，大流可以接为高分辨率高码率的视频流，小流则是低分辨率低码率的视频流。
   *
   * 正常情况下，用户接收大流。如需默认接收小流，可以调用本方法进行切换。SDK 会根据视频窗口的大小动态调整对应视频流的大小，以节约带宽和计算资源。
   *
   * 视频小流默认的宽高比和视频大流的宽高比一致。根据当前大流的宽高比，系统会自动分配小流的分辨率、帧率及码率。
   *
   * @param {StreamType} streamType 设置视频流的类型：
   * - 0：视频大流，即高分辨、高码率的视频流
   * - 1：视频小流，即低分辨、低码率的视频流
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Sets the default video-stream type of the remotely subscribed video stream
   * when the remote user sends dual streams.
   * @param {StreamType} streamType Sets the video stream type:
   * - 0: High-stream video, the high-resolution, high-bitrate video.
   * - 1: Low-stream video, the low-resolution, low-bitrate video.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setRemoteDefaultVideoStreamType(streamType: StreamType): number {
    return this.rtcEngine.setRemoteDefaultVideoStreamType(streamType);
  }

  /** @zh-cn
   * @deprecated 该方法已废弃。自 Native SDK v3.0.0 及之后，SDK 自动开启与 Web SDK 的互通，无需调用该方法开启。
   *
   * 打开与 Web SDK 的互通（仅在直播下适用）。
   *
   * 该方法打开或关闭与 Agora Web SDK 的互通。该方法仅在直播场景下适用，通信场景下默认互通是打开的。
   *
   * 如果有用户通过 Web SDK 加入频道，请确保调用该方法，否则 Web 端用户看 Native 端的画面会是黑屏。
   * @param {boolean} enable 是否打开与 Agora Web SDK 的互通：
   * - true：打开互通
   * - false：关闭互通（默认）
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @deprecated This method is deprecated. As of v3.0.0, the Electron SDK
   * automatically enables interoperability with the Web SDK, so you no longer
   * need to call this method.
   *
   * Enables interoperability with the Agora Web SDK (live streaming only).
   *
   * Use this method when the channel profile is `1` (live streaming).
   * Interoperability with the Agora Web SDK is enabled by default when the
   * channel profile is Communication.
   *
   * If the channel has Web SDK users, ensure that you call this method, or
   * the video of the Native user will be a black screen for the Web user.
   * @param {boolean} enable Sets whether to enable/disable interoperability
   * with the Agora Web SDK:
   * - true: Enable.
   * - false: (Default) Disable.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  enableWebSdkInteroperability(enable: boolean): number {
    return this.rtcEngine.enableWebSdkInteroperability(enable);
  }

  /** @zh-cn
   * 设置本地视频镜像。
   *
   * 该方法设置本地视频镜像，须在 {@link startPreview} 前设置。如果在开启预览后设置，
   * 需要重新开启预览才能生效。
   *
   *
   * @param {number} mirrortype 设置本地视频镜像模式：
   * - 0：（默认）SDK 自动开启镜像模式
   * - 1：启用镜像模式
   * - 2：关闭镜像模式
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Sets the local video mirror mode.
   *
   * Use this method before {@link startPreview}, or it does not take effect
   * until you re-enable startPreview.
   *
   * @param {number} mirrortype Sets the local video mirror mode:
   * - 0: (Default) The SDK enables the mirror mode.
   * - 1: Enable the mirror mode
   * - 2: Disable the mirror mode
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setLocalVideoMirrorMode(mirrortype: 0 | 1 | 2): number {
    return this.rtcEngine.setLocalVideoMirrorMode(mirrortype);
  }

  /** @zh-cn
   * 设置本地语音音调。
   *
   * @param {number} pitch 语音频率。可以在 [0.5, 2.0] 范围内设置。取值越小，则音调越低。默认值为 1.0，表示不需要修改音调
   * @returns {number}
   * - 0：方法调用成功
   * - -1：方法调用失败
   */
  /**
   * Changes the voice pitch of the local speaker.
   * @param {number} pitch - The value ranges between 0.5 and 2.0.
   * The lower the value, the lower the voice pitch.
   * The default value is 1.0 (no change to the local voice pitch).
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setLocalVoicePitch(pitch: number): number {
    return this.rtcEngine.setLocalVoicePitch(pitch);
  }

  /** @zh-cn
   * 设置本地语音音效均衡。
   *
   * @param {number} bandFrequency 频谱子带索引。取值范围是 [0, 9]，分别代表 10 个频带，对应的中心频率分别是 31，62，125，250，500，1k，2k，4k，8k，16 kHz
   * @param {number} bandGain 增益 (dB)。取值范围是 [-15, 15]，默认值为 0
   * @returns {number}
   * - 0：方法调用成功
   * - -1：方法调用失败
   */
  /**
   * Sets the local voice equalization effect.
   *
   * @param {number} bandFrequency Sets the index of the band center frequency.
   * The value ranges between 0 and 9, representing the respective band
   * center frequencies of the voice effects
   * including 31, 62, 125, 500, 1k, 2k, 4k, 8k, and 16kHz.
   * @param {number} bandGain Sets the gain (dB) of each band. The value
   * ranges between -15 and 15. The default value is 0.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setLocalVoiceEqualization(bandFrequency: number, bandGain: number): number {
    return this.rtcEngine.setLocalVoiceEqualization(bandFrequency, bandGain);
  }

  /** @zh-cn
   * 设置本地音效混响。
   *
   * @note Agora SDK 提供一个使用更为简便的接口 {@link setLocalVoiceReverbPreset}，该
   * 方法通过一系列内置参数的调整，直接实现流行、R&B、摇滚、嘻哈等预置的混响效果。
   * @param {number} reverbKey 混响音效类型。：
   * - `0`：原始声音强度 (dB)，即所谓的 dry signal，取值范围 [-20, 10]
   * - `1`：早期反射信号强度 (dB)，即所谓的 wet signal，取值范围 [-20, 10]
   * - `2`：所需混响效果的房间尺寸。一般房间越大，混响越强，取值范围 [0, 100]
   * - `3`：Wet signal 的初始延迟长度 (ms)，取值范围 [0, 200]
   * - `4`：混响持续的强度，取值范围为 [0, 100]
   * @param {number} value 设置混响音效的效果数值，各数值请参考 `reverbKey`
   * @returns {number}
   * - 0：方法调用成功
   * - -1：方法调用失败
   */
  /**
   * Sets the local voice reverberation.
   *
   * @param {number} reverbKey Sets the audio reverberation key.
   * - `0`: Level (dB) of the dry signal. The value ranges between -20 and 10.
   * - `1`: Level (dB) of the early reflection signal
   * (wet signal). The value ranges between -20 and 10.
   * - `2`: Room size of the reflection. A larger
   * room size means a stronger reverbration. The value ranges between 0 and
   * 100.
   * - `3`: Length (ms) of the initial delay of the wet
   * signal. The value ranges between 0 and 200.
   * - `4`: The reverberation strength. The value ranges between 0 and 100.
   *
   * @param {number} value Sets the effect of the reverberation key. See
   * `reverbKey` for the value range.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setLocalVoiceReverb(reverbKey: number, value: number): number {
    return this.rtcEngine.setLocalVoiceReverb(reverbKey, value);
  }

  /** @zh-cn
   * 设置本地语音变声。
   *
   * @deprecated 该方法自 v3.2.0 已废弃，请改用 {@link setAudioEffectPreset} 或 {@link setVoiceBeautifierPreset}。
   *
   * @note 该方法不能与 {@link setLocalVoiceReverbPreset} 方法同时使用，否则先调用的方法会不生效。
   * @param {VoiceChangerPreset} preset 设置本地语音的变声效果选项。
   *
   * @return
   * - 0：方法调用成功
   * - -1：方法调用失败
   */
  /**
   * @deprecated This method is deprecated from v3.2.0.
   * Use the following methods instead:
   * - {@link setAudioEffectPreset}
   * - {@link setVoiceBeautifierPreset}
   * - {@link setVoiceConversionPreset}
   *
   * Sets the local voice changer option.
   *
   * @param {VoiceChangerPreset} preset The local voice changer option.
   * See {@link VoiceChangerPreset}.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setLocalVoiceChanger(preset: VoiceChangerPreset): number {
    return this.rtcEngine.setLocalVoiceChanger(preset);
  }

  /** @zh-cn
   * @deprecated 该方法从 v3.2.0 起废弃，请改用 {@link setAudioEffectPreset} 或 {@link setVoiceBeautifierPreset}。
   *
   * 设置预设的本地语音混响效果选项。
   *
   * @note
   * - 该方法不能与 {@link setLocalVoiceReverbPreset} 方法同时使用。
   * - 该方法不能与 {@link setLocalVoiceChanger} 方法同时使用，否则先调的方法会不生效。
   * @param {AudioReverbPreset} preset 预设的本地语音混响效果选项
   *
   * @return
   * - 0：方法调用成功
   * - -1：方法调用失败
   */
  /**
   * @deprecated This method is deprecated from v3.2.0.
   * Use the {@link setAudioEffectPreset} or {@link setVoiceBeautifierPreset}
   * method instead.
   *
   * Sets the preset local voice reverberation effect.
   *
   * **Note**:
   * - Do not use this method together with {@link setLocalVoiceReverb}.
   * - Do not use this method together with {@link setLocalVoiceChanger},
   * or the method called eariler does not take effect.
   * @param {AudioReverbPreset} preset The local voice reverberation preset.
   * See {@link AudioReverbPreset}.
   */
  setLocalVoiceReverbPreset(preset: AudioReverbPreset) {
    return this.rtcEngine.setLocalVoiceReverbPreset(preset);
  }

  /** @zh-cn
   * 设置弱网条件下发布的音视频流回退选项。
   *
   * 网络不理想的环境下，音、视频的质量都会下降。使用该接口并将 option 设置为 `STREAM_FALLBACK_OPTION_AUDIO_ONLY (2)` 后，SDK 会：
   * - 在上行弱网且音视频质量严重受影响时，自动关断视频流，从而保证或提高音频质量。
   * - 持续监控网络质量，并在网络质量改善时恢复音视频流。
   *
   * 当本地推流回退为音频流时，或由音频流恢复为音视频流时，SDK 会触发 `localPublishFallbackToAudioOnly` 回调。
   *
   * @note 旁路推流场景下，设置本地推流回退为 Audio-only 可能会导致远端的 CDN 用户听到声音的时间有所延迟。因此在有旁路推流的场景下，Agora 建议不开启该功能。
   * @param {number} option 本地推流回退处理选项：
   * - `STREAM_FALLBACK_OPTION_DISABLED (0)`：（默认）上行网络较弱时，不对音视频流作回退处理，但不能保证音视频流的质量
   * - `STREAM_FALLBACK_OPTION_VIDEO_STREAM_LOW (1)`：（默认）下行网络较弱时只接收视频小流。该选项只对本方法无效。
   * - `STREAM_FALLBACK_OPTION_AUDIO_ONLY (2)`：上行网络较弱时只发布音频流
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Sets the fallback option for the locally published video stream based on
   * the network conditions.
   *
   * The default setting for option is `STREAM_FALLBACK_OPTION_AUDIO_ONLY (2)`,
   * where
   * there is no fallback for the locally published video stream when the
   * uplink network conditions are poor.
   * If `option` is set to `STREAM_FALLBACK_OPTION_AUDIO_ONLY (2)`, the SDK
   * will:
   * - Disable the upstream video but enable audio only when the network
   * conditions worsen and cannot support both video and audio.
   * - Re-enable the video when the network conditions improve.
   * When the locally published stream falls back to audio only or when the
   * audio stream switches back to the video,
   * the `localPublishFallbackToAudioOnly` callback is triggered.
   *
   * @note
   * Agora does not recommend using this method for CDN live streaming, because
   * the CDN audience will have a noticeable lag when the locally
   * publish stream falls back to audio-only.
   *
   * @param {number} option Sets the fallback option for the locally published
   * video stream.
   * - `STREAM_FALLBACK_OPTION_DISABLED (0)`: (Default) No fallback behavior
   * for the local/remote video stream when the uplink/downlink network
   * conditions are poor. The quality of the stream is not guaranteed.
   * - `STREAM_FALLBACK_OPTION_VIDEO_STREAM_LOW (1)`: (Default) The remote
   * video stream falls back to the low-stream video when the downlink network
   * condition worsens. This option works not for the
   * {@link setLocalPublishFallbackOption} method.
   * - `STREAM_FALLBACK_OPTION_AUDIO_ONLY (2)`: Under poor uplink network
   * conditions, the locally published video stream falls back to audio only.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setLocalPublishFallbackOption(option: 0 | 1 | 2): number {
    return this.rtcEngine.setLocalPublishFallbackOption(option);
  }

  /** @zh-cn
   * 设置弱网条件下订阅的音视频流回退选项。
   *
   * 网络不理想的环境下，音、视频的质量都会下降。使用该接口并将 option 设置为 `STREAM_FALLBACK_OPTION_VIDEO_STREAM_LOW (1)` 或者 `STREAM_FALLBACK_OPTION_AUDIO_ONLY (2)`后，SDK 会：
   * - 在下行弱网且音视频质量严重受影响时，将视频流切换为小流，或关断视频流，从而保证或提高音频质量。
   * - 持续监控网络质量，并在网络质量改善时恢复音视频流。
   *
   * 当远端订阅流回退为音频流时，或由音频流恢复为音视频流时，SDK 会触发 `remoteSubscribeFallbackToAudioOnly` 回调。
   * @param {number} option 远端订阅流回退处理选项：
   * - `STREAM_FALLBACK_OPTION_DISABLED (0)`：下行网络较弱时，不对音视频流作回退处理，但不能保证音视频流的质量
   * - `STREAM_FALLBACK_OPTION_VIDEO_STREAM_LOW (1)`：（默认）下行网络较弱时只接收视频小流。该选项只对该方法有效，对 {@link setLocalPublishFallbackOption} 方法无效
   * - `STREAM_FALLBACK_OPTION_AUDIO_ONLY (2)`：下行网络较弱时，先尝试只接收视频小流；如果网络环境无法显示视频，则再回退到只接收远端订阅的音频流
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Sets the fallback option for the remote video stream based
   * on the network conditions.
   *
   * If `option` is set as `STREAM_FALLBACK_OPTION_VIDEO_STREAM_LOW (1)` or
   * `STREAM_FALLBACK_OPTION_AUDIO_ONLY (2)`:
   * - the SDK automatically switches the video from a high-stream to a
   * low-stream, or disables the video when the downlink network condition
   * cannot support both audio and video
   * to guarantee the quality of the audio.
   * - The SDK monitors the network quality and restores the video stream when
   * the network conditions improve.
   *
   * When the remote video stream falls back to audio only or when
   * the audio-only stream switches back to the video stream,
   * the SDK triggers the `remoteSubscribeFallbackToAudioOnly` callback.
   *
   * @param {number} option Sets the fallback option for the remote stream.
   * - `STREAM_FALLBACK_OPTION_DISABLED (0)`: No fallback behavior for the
   * local/remote video stream when the uplink/downlink network conditions
   * are poor. The quality of the stream is not guaranteed.
   * - `STREAM_FALLBACK_OPTION_VIDEO_STREAM_LOW (1)`: (Default) The remote
   * video stream falls back to the low-stream video when the downlink network
   * condition worsens. This option works only
   * for this method and not for the {@link setLocalPublishFallbackOption}
   * method.
   * - `STREAM_FALLBACK_OPTION_AUDIO_ONLY (2)`: Under poor downlink network
   * conditions, the remote video stream first falls back to the
   * low-stream video; and then to an audio-only stream if the network
   * condition worsens.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setRemoteSubscribeFallbackOption(option: 0 | 1 | 2): number {
    return this.rtcEngine.setRemoteSubscribeFallbackOption(option);
  }

  /** @zh-cn
   * 注册本地用户 User account。
   *
   * 该方法为本地用户注册一个 User Account。注册成功后，该 User Account 即可标识该本地用户的身份，用户可以使用它加入频道。
   * 成功注册 User Account 后，本地会触发 onLocalUserRegistered 回调，告知本地用户的 UID 和 User Account。
   *
   * 该方法为可选。如果你希望用户使用 User Account 加入频道，可以选用以下两种方式：
   * - 先调用 {@link registerLocalUserAccount} 方法注册 Account，再调用 {@link joinChannelWithUserAccount} 方法加入频道。
   * - 直接调用 {@link joinChannelWithUserAccount} 方法加入频道。
   *
   * 两种方式的区别在于，提前调用 {@link registerLocalUserAccount}，可以缩短使用 {@link joinChannelWithUserAccount} 进入频道的时间。
   *
   * 为保证通信质量，请确保频道内使用同一类型的数据标识用户身份。即同一频道内需要统一使用 UID 或 User Account。如果有用户通过 Agora Web SDK 加入频道，请确保 Web 加入的用户也是同样类型。
   *
   * @note
   * - 请确保 `userAccount` 不能为空，否则该方法不生效。
   * - 请确保在该方法中设置的 `userAccount` 在频道中的唯一性。
   *
   * @param appId 你的项目在 Agora Console 注册的 App ID
   * @param userAccount 用户 User Account。该参数为必填，最大不超过 255 字节，不可填 null。请确保注册的 User Account 的唯一性。以下为支持的字符集范围（共 89 个字符）：
   * - 26 个小写英文字母 a-z
   * - 26 个大写英文字母 A-Z
   * - 10 个数字 0-9
   * - 空格
   * - "!", "#", "$", "%", "&", "(", ")", "+", "-", ":", ";", "<", "=", ".", ">", "?", "@", "[", "]", "^", "_", " {", "}", "|", "~", ","
   * @returns
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Registers a user account.
   * Once registered, the user account can be used to identify the local user
   * when the user joins the channel. After the user successfully registers a
   * user account,  the SDK triggers the onLocalUserRegistered callback on the
   * local client,
   * reporting the user ID and user account of the local user.
   *
   * To join a channel with a user account, you can choose either of the
   * following:
   * - Call the {@link registerLocalUserAccount} method to create a user
   * account, and then the {@link joinChannelWithUserAccount} method to
   * join the channel.
   * - Call the {@link joinChannelWithUserAccount} method to join the
   * channel.
   *
   * The difference between the two is that for the former, the time elapsed
   * between calling the {@link joinChannelWithUserAccount} method and joining
   * the channel is shorter than the latter.
   *
   * To ensure smooth communication, use the same parameter type to identify
   * the user. For example, if a user joins the channel with a user ID, then
   * ensure all the other users use the user ID too. The same applies to the
   * user account. If a user joins the channel with the Agora Web SDK, ensure
   * that the `uid` of the user is set to the same parameter type.
   *
   * **Note**:
   * - Ensure that you set the `userAccount` parameter. Otherwise, this method
   * does not take effect.
   * - Ensure that the value of the `userAccount` parameter is unique in the
   * channel.
   *
   * @param {string} appId The App ID of your project.
   * @param {string} userAccount The user account. The maximum length of this
   * parameter is 255 bytes. Ensure that you set this parameter and do not
   * set it as null. Ensure that you set this parameter and do not set it as
   * null.
   * Supported character scopes are:
   * - All lowercase English letters: a to z.
   * - All uppercase English letters: A to Z.
   * - All numeric characters: 0 to 9.
   * - The space character.
   * - Punctuation characters and other symbols, including: "!", "#", "$",
   * "%", "&", "(", ")", "+", "-", ":", ";", "<", "=", ".",
   * ">", "?", "@", "[", "]", "^", "_", " {", "}", "|", "~", ",".
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  registerLocalUserAccount(appId: string, userAccount: string): number {
    return this.rtcEngine.registerLocalUserAccount(appId, userAccount);
  }

  /** @zh-cn
   * 使用 User Account 加入频道。
   *
   * 该方法允许本地用户使用 User Account 加入频道。成功加入频道后，会触发以下回调：
   * - 本地：`localUserRegistered` 和 `userInfoUpdated`
   * - 远端：通信场景下的用户和直播场景下的主播加入频道后，远端会依次触发 `userJoined` 和 `userInfoUpdated` 回调
   *
   * @note 为保证通信质量，请确保频道内使用同一类型的数据标识用户身份。即同一频道内需要统一使用 UID 或 User Account。如果有用户通过 Agora Web SDK 加入频道，请确保 Web 加入的用户也是同样类型。
   *
   * @param token 在 App 服务器端生成的用于鉴权的 Token：
   * - 安全要求不高：你可以使用 Console 生成的临时 Token，详见[获取临时 Token](https://docs.agora.io/cn/Video/token?platform=All%20Platforms#获取临时-token)
   * - 安全要求高：将值设为你的服务端生成的正式 Token，详见[获取正式 Token](https://docs.agora.io/cn/Video/token?platform=All%20Platforms#获取正式-token)
   * @param channel 标识频道的频道名，最大不超过 64 字节。以下为支持的字符集范围（共 89 个字符）：
   * - 26 个小写英文字母 a-z
   * - 26 个大写英文字母 A-Z
   * - 10 个数字 0-9
   * - 空格
   * - "!", "#", "$", "%", "&", "(", ")", "+", "-", ":", ";", "<", "=", ".", ">", "?", "@", "[", "]", "^", "_", " {", "}", "|", "~", ","
   * @param userAccount 用户 User Account。该参数为必须，最大不超过 255 字节，不可为 NULL。请确保加入频道的 User Account 的唯一性。
   * - 26 个小写英文字母 a-z
   * - 26 个大写英文字母 A-Z
   * - 10 个数字 0-9
   * - 空格
   * - "!", "#", "$", "%", "&", "(", ")", "+", "-", ":", ";", "<", "=", ".", ">", "?", "@", "[", "]", "^", "_", " {", "}", "|", "~", ","
   * @returns
   * - 0：方法调用成功
   * - < 0：方法调用失败
   *  - 错误码 `2`，`3`，`5`
   */
  /**
   * Joins the channel with a user account.
   *
   * After the user successfully joins the channel, the SDK triggers the
   * following callbacks:
   * - The local client: localUserRegistered and userInfoUpdated.
   * - The remote client: userJoined and userInfoUpdated, if the user joining
   * the channel is in the communication(`0`) profile, or is a host in the
   * `1` (live streaming) profile.
   *
   * @note To ensure smooth communication, use the same parameter type to
   * identify the user. For example, if a user joins the channel with a user
   * ID, then ensure all the other users use the user ID too.
   * The same applies to the user account. If a user joins the channel with
   * the Agora Web SDK, ensure that the `uid` of the user is set to the same
   * parameter type.
   *
   * @param token The token generated at your server. For details,
   * see [Generate a token](https://docs.agora.io/en/Interactive%20Broadcast/token_server?platform=Electron).
   * @param channel The channel name. The maximum length of this
   * parameter is 64 bytes. Supported character scopes are:
   * - The 26 lowercase English letters: a to z.
   * - The 26 uppercase English letters: A to Z.
   * - The 10 numbers: 0 to 9.
   * - The space.
   * - "!", "#", "$", "%", "&", "(", ")", "+", "-", ":", ";", "<", "=", ".",
   * ">", "?", "@", "[", "]", "^", "_", " {", "}", "|", "~", ",".
   * @param userAccount The user account. The maximum length of this parameter
   * is 255 bytes. Ensure that you set this parameter and do not set it as
   * null. Supported character scopes are:
   * - All lowercase English letters: a to z.
   * - All uppercase English letters: A to Z.
   * - All numeric characters: 0 to 9.
   * - The space character.
   * - Punctuation characters and other symbols, including: "!", "#", "$",
   * "%", "&", "(", ")", "+", "-", ":", ";", "<", "=", ".", ">", "?", "@",
   * "[", "]", "^", "_", " {", "}", "|", "~", ",".
   * @param options The channel media options. See
   * {@link ChannelMediaOptions}.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   *  - `-2`
   *  - `-3`
   *  - `-5`
   *  - `-7`
   */
  joinChannelWithUserAccount(
    token: string,
    channel: string,
    userAccount: string,
    options?: ChannelMediaOptions
  ): number {
    return this.rtcEngine.joinChannelWithUserAccount(
      token,
      channel,
      userAccount,
      options
    );
  }

  /** @zh-cn
   * 通过 User Account 获取用户信息。
   *
   * 远端用户加入频道后，SDK 会获取到该远端用户的 UID 和 User Account，然后缓存一个包含了远端用户 UID 和 User Account 的 Mapping 表，
   * 并在本地触发 `userInfoUpdated` 回调。你收到这个回调后，可以调用该方法，通过传入 User Account 获取包含了指定用户 UID 的 `UserInfo` 对象。
   *
   * @param userAccount 用户 User Account
   *
   * @returns
   * - `errCode` 方法调用失败，返回错误码
   * - `userInfo` 方法调用成功，获取包含了指定用户 UID 的 `UserInfo` 对象
   */
  /**
   * Gets the user information by passing in the user account.
   *
   * After a remote user joins the channel, the SDK gets the user ID and user
   * account of the remote user, caches them in a mapping table object
   * (UserInfo),
   * and triggers the `userInfoUpdated` callback on the local client.
   * After receiving the callback, you can call this method to get the user ID
   * of the remote user from the `UserInfo` object by passing in the user
   * account.
   * @param userAccount The user account. Ensure that you set this parameter.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  getUserInfoByUserAccount(
    userAccount: string
  ): { errCode: number; userInfo: UserInfo } {
    return this.rtcEngine.getUserInfoByUserAccount(userAccount);
  }

  /** @zh-cn
   * 通过 UID 获取用户信息。
   *
   * 远端用户加入频道后， SDK 会获取到该远端用户的 UID 和 User Account，然后缓存一个包含了远端用户 UID 和 User Account 的 Mapping 表，
   * 并在本地触发 `userInfoUpdated` 回调。你收到这个回调后，可以调用该方法，通过传入 UID 获取包含了指定用户 User Account 的 `UserInfo` 对象。
   *
   * @param uid 用户 UID
   *
   * @returns
   * - `errCode` 方法调用失败，返回错误码
   * - `userInfo` 方法调用成功，返回包含了指定用户 User Account 的 `UserInfo` 对象
   *
   */
  /**
   * Gets the user information by passing in the user ID.
   *
   * After a remote user joins the channel, the SDK gets the user ID and user
   * account of the remote user, caches them in a mapping table object
   * (UserInfo), and triggers the userInfoUpdated callback on the local client.
   * After receiving the callback, you can call this method to get the user
   * account of the remote user from the UserInfo object by passing in the
   * user ID.
   * @param uid The user ID. Ensure that you set this parameter.
   *
   * @return
   * - errCode Error code.
   * - userInfo [in/out] A UserInfo object that identifies the user:
   *  - Input: A UserInfo object.
   *  - Output: A UserInfo object that contains the user account and user ID
   * of the user.
   */
  getUserInfoByUid(uid: number): { errCode: number; userInfo: UserInfo } {
    return this.rtcEngine.getUserInfoByUid(uid);
  }
  /** @zh-cn
   * 快速切换直播频道。
   *
   * 当直播频道中的观众想从一个频道切换到另一个频道时，可以调用该方法，实现快速切换。
   *
   * 成功调用该方切换频道后，本地会先收到离开原频道的回调 `leavechannel`，
   * 再收到成功加入新频道的回调 `joinedChannel`。
   *
   * @note 该方法仅适用直播场景下的的观众。
   *
   * @param token 在服务器端生成的用于鉴权的 Token：
   * - 安全要求不高：你可以填入在 Agora Console 获取到的临时 Token。详见
   * [获取临时 Token](https://docs.agora.io/cn/Video/token?platform=All%20Platforms#获取临时-token)
   * - 安全要求高：将值设为在 App 服务端生成的正式 Token。详
   * 见[获取 Token](https://docs.agora.io/cn/Video/token?platform=All%20Platforms#获取正式-token)

   * @param channel 标识频道的频道名，最大不超过 64 字节。以下为支持的字符集范围（共 89 个字符）：
   * - 26 个小写英文字母 a-z
   * - 26 个大写英文字母 A-Z
   * - 10 个数字 0-9
   * - 空格
   * - "!", "#", "$", "%", "&", "(", ")", "+", "-", ":", ";", "<", "=", ".",
   * ">", "?", "@", "[", "]", "^", "_", " {", "}", "|", "~", ","
   *
   * @returns
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /** Switches to a different channel, and configures whether to automatically
   * subscribe to audio or video streams in the target channel.
   *
   * @since v3.3.1
   *
   * This method allows the audience of a `1` (live streaming) channel to
   * switch to a different channel.
   *
   * After the user successfully switches to another channel, the
   * `leaveChannel` and `joinChannelSuccess` callbacks are triggered to
   * indicate that
   * the user has left the original channel and joined a new one.
   *
   * @note This method applies to the audience role in a `1` (live streaming)
   * channel only.
   *
   * @param token The token generated at your server. For details,
   * see [Generate a token](https://docs.agora.io/en/Interactive%20Broadcast/token_server?platform=Electron).
   * @param channelId The unique channel name for the Agora RTC session in
   * the string format smaller than 64 bytes. Supported characters:
   * - All lowercase English letters: a to z.
   * - All uppercase English letters: A to Z.
   * - All numeric characters: 0 to 9.
   * - The space character.
   * - Punctuation characters and other symbols, including:
   * "!", "#", "$", "%", "&", "(", ")", "+", "-", ":", ";", "<", "=", ".",
   * ">", "?", "@", "[", "]", "^", "_", " {", "}", "|", "~", ",".
   * @param options The channel media options. See {@link ChannelMediaOptions}.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   *  - `-1`: A general error occurs (no specified reason).
   *  - `-2`: The parameter is invalid.
   *  - `-5`: The request is rejected, probably because the user is not an
   * audience.
   *  - `-7`: The SDK is not initialized.
   *  - `-102`: The channel name is invalid.
   *  - `-113`: The user is not in the channel.
   */
  switchChannel(token: string, channel: string, options?: ChannelMediaOptions) : number {
    return this.rtcEngine.switchChannel(token, channel, options);
  }
  /** @zh-cn
   * 调节录音音量。
   *
   * @param {nummber} volume 录音信号音量，为避免回声并提升通话质量，Agora 建议取值为
   * [0,100]。如果设值需超过 100，请联系[技术支持](https://agora-ticket.agora.io/)。
   * - 0：静音
   * - 100：原始音量
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Adjusts the recording volume.
   * @param {number} volume Recording volume. To avoid echoes and improve call
   * quality, Agora recommends setting the value of volume between 0 and 100.
   * If you need to set the value higher than 100, contact support@agora.io
   * first.
   * - 0: Mute.
   * - 100: Original volume.
   * protection.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  adjustRecordingSignalVolume(volume: number): number {
    return this.rtcEngine.adjustRecordingSignalVolume(volume);
  }
  /** @zh-cn
   * 调节播放人声的音量。
   *
   * @param {nummber} volume 播放人声的信号音量。为避免回声并提升通话质量，Agora 建议将取值
   * 为 [0,100]。如设值需超过 100，请联系[技术支持](https://agora-ticket.agora.io/)。
   * - 0：静音
   * - 100：原始音量
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Adjusts the playback volume of the voice.
   * @param volume Playback volume of the voice. To avoid echoes and improve
   * call quality, Agora recommends setting the value of volume between 0 and
   * 100. If you need to set the value higher than 100, contact
   * support@agora.io first.
   * - 0: Mute.
   * - 100: Original volume.
   * protection.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  adjustPlaybackSignalVolume(volume: number): number {
    return this.rtcEngine.adjustPlaybackSignalVolume(volume);
  }
  /** @zh-cn
   * @since v3.0.0
   *
   * 调节本地播放的指定远端用户音量。
   *
   * 你可以在通话中调用该方法调节指定远端用户在本地播放的音量。如需调节多个用户在本地播放的
   * 音量，则需多次调用该方法。
   *
   * @note
   * - 请在加入频道后，调用该方法。
   * - 该方法调节的是本地播放的指定远端用户混音后的音量。
   *
   * @param uid 远端用户 ID。
   * @param volume 播放音量，取值范围为 [0,100]:
   * - 0: 静音
   * - 100: 原始音量
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Adjusts the playback volume of a specified remote user.
   *
   * You can call this method as many times as necessary to adjust the playback
   * volume of different remote users, or to repeatedly adjust the playback
   * volume of the same remote user.
   *
   * @note
   * - Call this method after joining a channel.
   * - The playback volume here refers to the mixed volume of a specified
   * remote user.
   * - This method can only adjust the playback volume of one specified remote
   * user at a time. To adjust the playback volume of different remote users,
   * call the method as many times, once for each remote user.
   *
   * @param uid The ID of the remote user.
   * @param volume The playback volume of the specified remote user. The value
   * ranges from 0 to 100:
   * - 0: Mute.
   * - 100: Original volume.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  adjustUserPlaybackSignalVolume(uid: number, volume: number): number {
    return this.rtcEngine.adjustUserPlaybackSignalVolume(uid, volume);
  }

  // ===========================================================================
  // DEVICE MANAGEMENT
  // ===========================================================================
  /**
   * Gets the list of the video devices.
   * @return {Array} The array of the video devices.
   */
  getVideoDevices(): Array<Object> {
    return this.rtcEngine.getVideoDevices();
  }

  /** @zh-cn
   * 设置视频设备。
   * @param {string} deviceId 设备 ID
   * @returns {number}
   * - true：方法调用成功
   * - false：方法调用失败
   */
  /**
   * Sets the video device using the device Id.
   * @param {string} deviceId The device Id.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setVideoDevice(deviceId: string): number {
    return this.rtcEngine.setVideoDevice(deviceId);
  }

  /** @zh-cn
   * 获取当前的视频设备。
   * @return {Object} 视频设备对象
   */
  /**
   * Gets the current video device.
   * @return {Object} The video device.
   */
  getCurrentVideoDevice(): Object {
    return this.rtcEngine.getCurrentVideoDevice();
  }

  /** @zh-cn
   * 开始视频设备测试。
   *
   * 该方法测试视频采集设备是否正常工作。
   *
   * @note 请确保在调用该方法前已调用 {@link enableVideo}，且输入视频的 HWND/View 是有效的。
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Starts a video-capture device test.
   *
   * **Note**:
   * This method tests whether the video-capture device works properly.
   * Ensure that you call the {@link enableVideo} method before calling this
   * method and that the HWND window handle of the incoming parameter is valid.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  startVideoDeviceTest(): number {
    return this.rtcEngine.startVideoDeviceTest();
  }

  /** @zh-cn
   * 停止视频设备测试。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Stops the video-capture device test.
   *
   * **Note**:
   * This method stops testing the video-capture device.
   * You must call this method to stop the test after calling the
   * {@link startVideoDeviceTest} method.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  stopVideoDeviceTest(): number {
    return this.rtcEngine.stopVideoDeviceTest();
  }

  /** @zh-cn
   * 获取音频播放设备列表。
   * @returns {Array} 音频播放设备的 Array
   */
  /**
   * Retrieves the audio playback device associated with the device ID.
   * @return {Array} The array of the audio playback device.
   */
  getAudioPlaybackDevices(): Array<Object> {
    return this.rtcEngine.getAudioPlaybackDevices();
  }

  /** @zh-cn
   * 通过设备 ID 指定音频播放设备
   * @param {string} deviceId 音频播放设备的 ID
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Sets the audio playback device using the device ID.
   * @param {string} deviceId The device ID of the audio playback device.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setAudioPlaybackDevice(deviceId: string): number {
    return this.rtcEngine.setAudioPlaybackDevice(deviceId);
  }
  /** @zh-cn
   * 获取播放设备信息。
   * @param {string} deviceId 设备 ID
   * @param {string} deviceName 设备名称
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Retrieves the audio playback device information associated with the
   * device ID and device name.
   * @param {string} deviceId The device ID of the audio playback device.
   * @param {string} deviceName The device name of the audio playback device.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */

  getPlaybackDeviceInfo(deviceId: string, deviceName: string): number {
    return this.rtcEngine.getPlaybackDeviceInfo(deviceId, deviceName);
  }

  /** @zh-cn
   * 获取当前的音频播放设备。
   * @return {Object} 音频播放设备对象
   */
  /**
   * Gets the current audio playback device.
   * @return {Object} The current audio playback device.
   */
  getCurrentAudioPlaybackDevice(): Object {
    return this.rtcEngine.getCurrentAudioPlaybackDevice();
  }

  /** @zh-cn
   * 设置音频播放设备的音量
   * @param {number} volume 播放设备音量（分贝）。取值范围 [0,255]
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Sets the volume of the audio playback device.
   * @param {number} volume Sets the volume of the audio playback device. The
   * value ranges between 0 (lowest volume) and 255 (highest volume).
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setAudioPlaybackVolume(volume: number): number {
    return this.rtcEngine.setAudioPlaybackVolume(volume);
  }

  /** @zh-cn
   * 获取音频播放设备的音量
   * @returns {number} 播放设备音量（分贝）。取值范围 [0,255]
   */
  /**
   * Retrieves the volume of the audio playback device.
   * @return The audio playback device volume.
   */
  getAudioPlaybackVolume(): number {
    return this.rtcEngine.getAudioPlaybackVolume();
  }

  /** @zh-cn
   * 获取音频录制设备
   * @returns {Array} 音频录制设备的 Array
   */
  /**
   * Retrieves the audio recording device associated with the device ID.
   * @return {Array} The array of the audio recording device.
   */
  getAudioRecordingDevices(): Array<Object> {
    return this.rtcEngine.getAudioRecordingDevices();
  }

  /** @zh-cn
   * 设置音频录制设备
   * @param {string} deviceId 设备 ID
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Sets the audio recording device using the device ID.
   * @param {string} deviceId The device ID of the audio recording device.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setAudioRecordingDevice(deviceId: string): number {
    return this.rtcEngine.setAudioRecordingDevice(deviceId);
  }

  /** @zh-cn
   * 获取录制设备信息。
   * @param {string} deviceId 设备 ID
   * @param {string} deviceName 设备名
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Retrieves the audio recording device information associated with the
   * device ID and device name.
   * @param {string} deviceId The device ID of the recording audio device.
   * @param {string} deviceName  The device name of the recording audio device.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  getRecordingDeviceInfo(deviceId: string, deviceName: string): number {
    return this.rtcEngine.getRecordingDeviceInfo(deviceId, deviceName);
  }

  /** @zh-cn
   * 获取当前的音频录制设备。
   * @returns {Object} 音频录制设备对象
   */
  /**
   * Gets the current audio recording device.
   * @return {Object} The audio recording device.
   */
  getCurrentAudioRecordingDevice(): Object {
    return this.rtcEngine.getCurrentAudioRecordingDevice();
  }

  /** @zh-cn
   * 获取录制设备的音量。
   * @return {number} 录音设备音量（分贝）。取值范围 [0,255]
   */
  /**
   * Retrieves the volume of the microphone.
   * @return {number} The microphone volume. The volume value ranges between
   * 0 (lowest volume) and 255 (highest volume).
   */
  getAudioRecordingVolume(): number {
    return this.rtcEngine.getAudioRecordingVolume();
  }

  /** @zh-cn
   * 设置录音设备的音量
   * @param {number} volume 录音设备的音量（分贝）。取值范围 [0, 255]
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Sets the volume of the microphone.
   * @param {number} volume Sets the volume of the microphone. The value
   * ranges between 0 (lowest volume) and 255 (highest volume).
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setAudioRecordingVolume(volume: number): number {
    return this.rtcEngine.setAudioRecordingVolume(volume);
  }

  /** @zh-cn
   * 开始音频播放设备测试。
   *
   * 该方法检测音频播放设备是否正常工作。SDK 会播放用户指定的音乐文件，如果用户可以听到声音，则说明播放设备正常工作。
   * @param {string} filepath 用来测试的音乐文件的路径
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Starts the audio playback device test.
   *
   * This method tests if the playback device works properly. In the test,
   * the SDK plays an audio file specified by the user.
   * If the user can hear the audio, the playback device works properly.
   * @param {string} filepath The path of the audio file for the audio playback
   * device test in UTF-8:
   * - Supported file formats: wav, mp3, m4a, and aac.
   * - Supported file sample rates: 8000, 16000, 32000, 44100, and 48000 Hz.
   * @return
   * - 0: Success, and you can hear the sound of the specified audio file.
   * - < 0: Failure.
   */
  startAudioPlaybackDeviceTest(filepath: string): number {
    return this.rtcEngine.startAudioPlaybackDeviceTest(filepath);
  }

  /** @zh-cn
   * 停止播放设备测试。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Stops the audio playback device test.
   *
   * This method stops testing the audio playback device.
   * You must call this method to stop the test after calling the
   * {@link startAudioPlaybackDeviceTest} method.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  stopAudioPlaybackDeviceTest(): number {
    return this.rtcEngine.stopAudioPlaybackDeviceTest();
  }

  /** @zh-cn
   * 开始音频设备回路测试。
   *
   * 该方法测试本地的音频设备是否正常工作。
   *
   * 调用该方法后，麦克风会采集本地语音并通过扬声器播放出来，用户需要配合说一段话。SDK 会通过 `groupAudioVolumeIndication` 回调向 App 上报音量信息。
   *
   * @note 该方法仅在本地进行音频设备测试，不涉及网络连接。
   * @param interval SDK 返回 `groupAudioVolumeIndication` 回调的时间间隔，单位为毫秒。建议设置到大于 200 毫秒。最小不得少于 10 毫秒。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Starts the audio device loopback test.
   *
   * This method tests whether the local audio devices are working properly.
   * After calling this method, the microphone captures the local audio and
   * plays it through the speaker.
   *
   * **Note**:
   * This method tests the local audio devices and does not report the network
   * conditions.
   * @param {number} interval The time interval (ms).
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  startAudioDeviceLoopbackTest(interval: number): number {
    return this.rtcEngine.startAudioDeviceLoopbackTest(interval);
  }

  /** @zh-cn
   * 停止音频设备回路测试。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Stops the audio device loopback test.
   *
   * **Note**:
   * Ensure that you call this method to stop the loopback test after calling
   * the {@link startAudioDeviceLoopbackTest} method.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  stopAudioDeviceLoopbackTest(): number {
    return this.rtcEngine.stopAudioDeviceLoopbackTest();
  }

  /** @zh-cn
   * 开启声卡采集。
   *
   * 启用声卡采集功能后，声卡播放的声音会被合到本地音频流中，从而可以发送到远端。
   *
   * @note 该方法在加入频道前后都能调用。
   *
   * @param {boolean} enable 是否开启声卡采集：
   * - true：开启声卡采集
   * - false：（默认）关闭声卡采集
   *
   * @param {string|null} deviceName 声卡的设备名。
   * - 默认设为 null，即使用当前声卡采集。
   * - 如果用户使用虚拟声卡，如 Soundflower，可以将虚拟声卡名称 `"soundflower"`
   * 作为参数传入，SDK 会找到对应的虚拟声卡设备，并开始采集。**Note**: macOS 系统默认声卡
   * 不支持采集功能，如需开启此功能需要 App 自己启用一个虚拟声卡，并将该虚拟声卡的名字
   * 作为 `deviceName` 传入 SDK。 Agora 测试并推荐 soundflower 作为虚拟声卡。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /** Enables loopback audio capturing.
   *
   * If you enable loopback audio capturing, the output of the sound card is
   * mixed into the audio stream sent to the other end.
   *
   * @note You can call this method either before or after joining a channel.
   *
   * @param enable Sets whether to enable/disable loopback capturing.
   * - true: Enable loopback capturing.
   * - false: (Default) Disable loopback capturing.
   * @param deviceName The device name of the sound card. The default value
   * is NULL (the default sound card). **Note**: macOS does not support
   * loopback capturing of the default sound card.
   * If you need to use this method, please use a virtual sound card and pass
   * its name to the deviceName parameter. Agora has tested and recommends
   * using soundflower.
   *
   * @return
   * - 0: Success
   * - < 0: Failure
   */
  enableLoopbackRecording(
    enable = false,
    deviceName: string | null = null
  ): number {
    return this.rtcEngine.enableLoopbackRecording(enable, deviceName);
  }
  /** @zh-cn
   * 开始客户端录音。
   *
   * Agora SDK 支持通话过程中在客户端进行录音。调用该方法后，你可以录制频道内所有用户的音频，
   * 并得到一个包含所有用户声音的录音文件。录音文件格式可以为:
   * - .wav: 文件大，音质保真度较高。
   * - .aac: 文件小，音质保真度较低。
   *
   * @note
   * - 请确保你在该方法中指定的路径存在并且可写。
   * - 该接口需在 {@link joinChannel} 之后调用。如果调用 {@link leaveChannel} 时还在
   * 录音，录音会自动停止。
   * - 为保证录音效果，当 `sampleRate` 设为 44.1 kHz 或 48 kHz 时，建议将 `quality`
   * 设为 MEDIUM 或 HIGH 。
   * @param filePath 录音文件在本地保存的绝对路径，由用户自行指定，需精确到文件名及格式，
   * 例如：`c:/music/audio.aac`（Windows）和 `file:///Users/Agora/Music/audio.aac`（macOS）。
   * @param sampleRate 录音采样率（Hz），可以设为以下值：
   * - 16000
   * - 32000（默认）
   * - 44100
   * - 48000
   * @param quality 录音音质:
   * - `0`: 低音质。采样率为 32 kHz，录制 10 分钟的文件大小为 1.2 M 左右。
   * - `1`: 中音质。采样率为 32 kHz，录制 10 分钟的文件大小为 2 M 左右。
   * - `2`: 高音质。采样率为 32 kHz，录制 10 分钟的文件大小为 3.75 M 左右。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @since v3.0.0
   *
   * Starts an audio recording on the client.
   *
   * The SDK allows recording during a call. After successfully calling this
   * method, you can record the audio of all the users in the channel and get
   * an audio recording file.
   * Supported formats of the recording file are as follows:
   * - .wav: Large file size with high fidelity.
   * - .aac: Small file size with low fidelity.
   *
   * @note
   * - Ensure that the directory you use to save the recording file exists and
   * is writable.
   * - This method is usually called after {@link joinChannel}. The
   * recording automatically stops when you call {@link leaveChannel}.
   * - For better recording effects, set quality as MEDIUM or HIGH when
   * `sampleRate` is 44.1 kHz or 48 kHz.
   *
   * @param filePath The absolute file path of the recording file. The string
   * of the file name is in UTF-8, such as `c:/music/audio.aac` for Windows and
   * `file:///Users/Agora/Music/audio.aac` for macOS.
   * @param sampleRate Sample rate (Hz) of the recording file. Supported
   * values are as follows:
   * - 16000
   * - (Default) 32000
   * - 44100
   * - 48000
   * @param quality The audio recording quality:
   * - `0`: Low quality. The sample rate is 32 kHz, and the file size is around
   * 1.2 MB after 10 minutes of recording.
   * - `1`: Medium quality. The sample rate is 32 kHz, and the file size is
   * around 2 MB after 10 minutes of recording.
   * - `2`: High quality. The sample rate is 32 kHz, and the file size is
   * around 3.75 MB after 10 minutes of recording.
   *
   * @return
   * - 0: Success
   * - < 0: Failure
   */
  startAudioRecording(filePath: string, sampleRate:number, quality: number):number {
    return this.rtcEngine.startAudioRecording(filePath, sampleRate, quality)
  }
  /**
   * 停止客户端录音。
   *
   * 调用 {@link leaveChannel} 离开频道时，也会自动停止客户端录音。
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Stops an audio recording on the client.
   *
   * You can call this method before calling the {@link leaveChannel} method
   * else to stop the recording automatically.
   *
   * @return
   * - 0: Success
   * - < 0: Failure
   */
  stopAudioRecording():number {
    return this.rtcEngine.stopAudioRecording()
  }

  /** @zh-cn
   * 开始音频录制设备测试。
   *
   * 该方法测试麦克风是否正常工作。开始测试后，SDK 会通过 `groupAudioVolumeIndication` 回调向 App 上报音量信息。
   *
   * @param {number} indicateInterval `groupAudioVolumeIndication` 回调的周期（毫秒）
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Starts the microphone test.
   *
   * This method checks whether the microphone works properly.
   * @param {number} indicateInterval The interval period (ms).
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  startAudioRecordingDeviceTest(indicateInterval: number): number {
    return this.rtcEngine.startAudioRecordingDeviceTest(indicateInterval);
  }

  /** @zh-cn
   * 停止音频录制设备测试。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Stops the microphone test.
   *
   * **Note**:
   * This method stops the microphone test.
   * You must call this method to stop the test after calling the
   * {@link startAudioRecordingDeviceTest} method.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  stopAudioRecordingDeviceTest(): number {
    return this.rtcEngine.stopAudioRecordingDeviceTest();
  }

  /** @zh-cn
   * 获取当前音频播放设备的静音状态。
   * @returns {boolean}
   * - `true`：当前音频播放设备静音
   * - `false`：当前音频播放设备不静音
   */
  /**
   * check whether selected audio playback device is muted
   * @return {boolean} muted/unmuted
   */
  getAudioPlaybackDeviceMute(): boolean {
    return this.rtcEngine.getAudioPlaybackDeviceMute();
  }

  /** @zh-cn
   * 设置当前音频播放设备为静音/不静音。
   * @param {boolean} mute 是否设置当前音频播放设备静音：
   * - `true`：设置当前音频播放设备静音
   * - `false`：设置当前音频播放设备不静音
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Mutes the audio playback device.
   * @param {boolean} mute Sets whether to mute/unmute the audio playback
   * device:
   * - true: Mutes.
   * - false: Unmutes.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setAudioPlaybackDeviceMute(mute: boolean): number {
    return this.rtcEngine.setAudioPlaybackDeviceMute(mute);
  }

  /** @zh-cn
   * 获取当前音频录制设备的静音状态。
   * @returns {boolean}
   * - `true`：当前音频录制设备静音
   * - `false`：当前音频录制设备不静音
   */
  /**
   * Retrieves the mute status of the audio playback device.
   * @return {boolean} Whether to mute/unmute the audio playback device:
   * - true: Mutes.
   * - false: Unmutes.
   */
  getAudioRecordingDeviceMute(): boolean {
    return this.rtcEngine.getAudioRecordingDeviceMute();
  }

  /** @zh-cn
   * 设置当前音频录制设备静音/不静音。
   * @param {boolean} mute 是否设置当前音频录制设备静音：
   * - `true`：设置静音
   * - `false`：设置不静音
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Mutes/Unmutes the microphone.
   * @param {boolean} mute Sets whether to mute/unmute the audio playback
   * device:
   * - true: Mutes.
   * - false: Unmutes.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setAudioRecordingDeviceMute(mute: boolean): number {
    return this.rtcEngine.setAudioRecordingDeviceMute(mute);
  }

  // ===========================================================================
  // VIDEO SOURCE
  // NOTE. video source is mainly used to do screenshare, the api basically
  // aligns with normal sdk apis, e.g. videoSourceInitialize vs initialize.
  // it is used to do screenshare with a separate process, in that case
  // it allows user to do screensharing and camera stream pushing at the
  // same time - which is not allowed in single sdk process.
  // if you only need to display camera and screensharing one at a time
  // use sdk original screenshare, if you want both, use video source.
  // ===========================================================================
  /** @zh-cn
   * 双实例方法：初始化 `videoSource` 对象
   *
   * @param {string} appId 你在 Agora Console 创建项目的 APP ID
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   *  - `ERR_INVALID_APP_ID (101)`: App ID 无效，请检查你的 App ID
   */
  /**
   * Initializes agora real-time-communicating video source with the app Id.
   * @param {string} appId The app ID issued to you by Agora.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   *  - `ERR_INVALID_APP_ID (101)`: The app ID is invalid. Check if it is in
   * the correct format.
   */
  videoSourceInitialize(appId: string): number {
    return this.rtcEngine.videoSourceInitialize(appId);
  }

  /** @zh-cn
   * 双实例方法：设置 `videoSource` 的渲染器
   * @param {Element} view 播放共享视频的 Dom
   */
  /**
   * Sets the video renderer for video source.
   * @param {Element} view The dom element where video source should be
   * displayed.
   */
  setupLocalVideoSource(view: Element): void {
    this.initRender('videosource', view, "");
  }

  /** @zh-cn
   * @deprecated 该方法已废弃。自 Native SDK v3.0.0 及之后，SDK 自动开启与 Web SDK 的互通，无需调用该方法开启。
   *
   * 双实例方法：开启 `videoSource` 与 Web SDK 互通
   *
   * @note 该方法需要在 {@link videoSourceInitialize} 之后调用。
   *
   * @param {boolean} enabled 是否开启与 Web SDK 之间的互通：
   * - `true`：开启与 Web SDK 的互通
   * - `false`：不开启与 Web SDK 的互通
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @deprecated This method is deprecated. As of v3.0.0, the Electron SDK
   * automatically enables interoperability with the Web SDK, so you no longer
   * need to call this method.
   *
   * Enables the web interoperability of the video source, if you set it to
   * true.
   *
   * **Note**:
   * You must call this method after calling the {@link videoSourceInitialize}
   * method.
   *
   * @param {boolean} enabled Set whether or not to enable the web
   * interoperability of the video source.
   * - true: Enables the web interoperability.
   * - false: Disables web interoperability.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  videoSourceEnableWebSdkInteroperability(enabled: boolean): number {
    return this.rtcEngine.videoSourceEnableWebSdkInteroperability(enabled);
  }

  /** @zh-cn
   *
   * 双实例方法：`videoSource` 加入频道。
   * @param {string} token 在 App 服务器端生成的用于鉴权的 Token：
   * - 安全要求不高：你可以填入在 Agora Console 获取到的临时 Token。详见[获取临时 Token](https://docs.agora.io/cn/Video/token?platform=All%20Platforms#获取临时-token)
   * - 安全要求高：将值设为在 App 服务端生成的正式 Token。详见[获取 Token](https://docs.agora.io/cn/Video/token?platform=All%20Platforms#获取正式-token)
   * @param {string} cname 标识频道的频道名，最大不超过 64 字节。以下为支持的字符集范围（共 89 个字符）：
   * - 26 个小写英文字母 a-z
   * - 26 个大写英文字母 A-Z
   * - 10 个数字 0-9
   * - 空格
   * - "!", "#", "$", "%", "&", "(", ")", "+", "-", ":", ";", "<", "=", ".", ">", "?", "@", "[", "]", "^", "_", " {", "}", "|", "~", ","
   * @param {string} info 频道信息
   * @param {number} uid `videoSource` 的用户 ID。一个频道内不能出现相同的用户 ID。请确保 `videoSource` 用户 ID 和用户 {@link joinChannel} 时使用的 `uid` 不同。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Allows a user to join a channel when using the video source.
   *
   * @param {string} token The token generated at your server:
   * - For low-security requirements: You can use the temporary token
   * generated at Console. For details, see
   * [Get a temporary token](https://docs.agora.io/en/Voice/token?platform=All%20Platforms#get-a-temporary-token).
   * - For high-security requirements: Set it as the token generated at your
   * server. For details, see
   * [Get a token](https://docs.agora.io/en/Voice/token?platform=All%20Platforms#get-a-token).
   * @param {string} cname (Required) The unique channel name for
   * the Agora RTC session in the string format smaller than 64 bytes.
   * Supported characters:
   * - The 26 lowercase English letters: a to z.
   * - The 26 uppercase English letters: A to Z.
   * - The 10 numbers: 0 to 9.
   * - The space.
   * - "!", "#", "$", "%", "&", "(", ")", "+", "-", ":", ";", "<", "=", ".",
   * ">", "?", "@", "[", "]", "^", "_", " {", "}", "|", "~", ",".
   * @param {string} info Additional information about the channel.
   * This parameter can be set to NULL or contain channel related information.
   * Other users in the channel will not receive this message.
   * @param {number} uid The User ID. The same user ID cannot appear in a
   * channel. Ensure that the user ID of the `videoSource` here is different
   * from the `uid` used by the user when calling the {@link joinChannel}
   * method.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  videoSourceJoin(
    token: string,
    cname: string,
    info: string,
    uid: number
  ): number {
    return this.rtcEngine.videoSourceJoin(token, cname, info, uid);
  }

  /** @zh-cn
   * 双实例方法：`videoSource` 离开频道。
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Allows a user to leave a channe when using the video source.
   *
   * **Note**:
   * You must call this method after calling the {@link videoSourceJoin} method.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  videoSourceLeave(): number {
    return this.rtcEngine.videoSourceLeave();
  }

  /** @zh-cn
   *
   * 双实例方法：更新 `videoSource` 的 Token
   * @param {string} token 新的 Token
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Gets a new token for a user using the video source when the current token
   * expires after a period of time.
   *
   * The application should call this method to get the new `token`.
   * Failure to do so will result in the SDK disconnecting from the server.
   *
   * @param {string} token The new token.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  videoSourceRenewToken(token: string): number {
    return this.rtcEngine.videoSourceRenewToken(token);
  }

  /** @zh-cn
   * 双实例方法：设置 `videoSource` 的频道场景。
   * @param {number} profile 频道场景：
   * - 0：通信场景（默认）
   * - 1：直播场景
   * - 2：游戏模式
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Sets the channel profile when using the video source.
   *
   * @param {number} profile Sets the channel profile:
   * - 0:(Default) Communication.
   * - 1: Live streaming.
   * - 2: Gaming.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  videoSourceSetChannelProfile(profile: number): number {
    return this.rtcEngine.videoSourceSetChannelProfile(profile);
  }

  /** @zh-cn
   * 双实例方法：设置 `videoSource` 的视频属性。
   *
   * @note 请在 {@link startScreenCapture2} 后调用该方法。
   * @param {VIDEO_PROFILE_TYPE} profile 视频属性
   * @param {boolean} swapWidthAndHeight 是否交换视频的宽和高：
   * - true：交换视频的宽和高
   * - false：不交换视频的宽和高（默认）
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Sets the video profile when using the video source.
   * @param {VIDEO_PROFILE_TYPE} profile The video profile. See
   * {@link VIDEO_PROFILE_TYPE}.
   * @param {boolean} [swapWidthAndHeight = false] Whether to swap width and
   * height:
   * - true: Swap the width and height.
   * - false: Do not swap the width and height.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  videoSourceSetVideoProfile(
    profile: VIDEO_PROFILE_TYPE,
    swapWidthAndHeight = false
  ): number {
    return this.rtcEngine.videoSourceSetVideoProfile(
      profile,
      swapWidthAndHeight
    );
  }

  /** @zh-cn
   * 获取系统窗口信息。
   *
   * 该方法获取所有系统（macOS 或 Windows）窗口 ID，以及相关信息。你可以使用获取到的窗口 ID 进行屏幕共享。
   * @returns {Array} 系统窗口 ID 和相关信息列表
   */
  /**
   * Gets the window ID when using the video source.
   *
   * This method gets the ID of the whole window and relevant inforamtion.
   * You can share the whole or part of a window by specifying the window ID.
   * @return {Array} The array list of the window ID and relevant information.
   */
  getScreenWindowsInfo(): Array<Object> {
    return this.rtcEngine.getScreenWindowsInfo();
  }

  /** @zh-cn
   * 获取屏幕信息。
   *
   * 该方法获取所有的系统（macOS 或 Windows）屏幕 ID，以及相关信息。你可以使用获取到的屏幕 ID 进行屏幕共享。
   * @returns {Array} 系统屏幕 ID 和相关信息列表。Windows 和 macOS 系统中返回的屏幕 ID（displayId）不同。
   * 你无需关注返回对象的具体内容，直接使用它进行屏幕共享即可。
   */
  /**
   * Gets the display ID when using the video source.
   *
   * This method gets the ID of the whole display and relevant inforamtion.
   * You can share the whole or part of a display by specifying the window ID.
   * @return {Array} The array list of the display ID and relevant information.
   * The display ID returned is different on Windows and macOS systems.
   * You don't need to pay attention to the specific content of the returned
   * object, just use it for screen sharing.
   */
  getScreenDisplaysInfo(): Array<Object> {
    return this.rtcEngine.getScreenDisplaysInfo();
  }

  /** @zh-cn
   * @deprecated 该方法已废弃，请改用 {@link videoSourceStartScreenCaptureByScreen} 或 {@link videoSourceStartScreenCaptureByWindow}
   *
   * 双实例方法：共享屏幕。
   *
   * 共享一个窗口或该窗口的部分区域。你需要在该方法中指定想要共享的窗口 ID。
   *
   * @note 设置 `rect` 时你需要注意：
   * - 如果设置的共享区域超出了窗口的边界，则只共享窗口内的内容
   * - 如果 `left` 和 `right` 值一样，即宽为 0，则共享整个窗口
   * - 如果 `top` 和 `bottom` 值一样，即高 为 0，则共享整个窗口
   *
   * @param {number} windowId 待共享的窗口 ID
   * @param {number} captureFreq 共享视频的编码帧率（fps）。默认值为 5，建议不要超过 15
   * @param {*} rect 共享窗口相对于屏幕左上角的相对位置和大小，可设为 null
   * @param {number} bitrate 共享视频的码率（Kbps）；默认值为 0，表示由 SDK 根据当前共享的分辨率计算出一个合理的值
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @deprecated This method is deprecated. Use
   * {@link videoSourceStartScreenCaptureByScreen} or
   * {@link videoSourceStartScreenCaptureByWindow} instead.
   *
   * Starts the video source.
   * @param {number} wndid Sets the video source area.
   * @param {number} captureFreq (Mandatory) The captured frame rate. The value
   * ranges between 1 fps and 15 fps.
   * @param {*} rect Specifies the video source region. `rect` is valid when
   * `wndid` is set as 0. When `rect` is set as NULL, the whole screen is
   * shared.
   * @param {number} bitrate The captured bitrate.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  startScreenCapture2(
    windowId: number,
    captureFreq: number,
    rect: { left: number; right: number; top: number; bottom: number },
    bitrate: number
  ): number {
    deprecate(
      '"videoSourceStartScreenCaptureByScreen" or "videoSourceStartScreenCaptureByWindow"'
    );
    return this.rtcEngine.startScreenCapture2(
      windowId,
      captureFreq,
      rect,
      bitrate
    );
  }

  /** @zh-cn
   * 双实例方法：停止共享屏幕。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Stops the screen sharing when using the video source.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  stopScreenCapture2(): number {
    return this.rtcEngine.stopScreenCapture2();
  }

  /** @zh-cn
   * 双实例方法：开启预览共享屏幕。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Starts the local video preview when using the video source.
   * @return
   * - 0: Success
   * - < 0: Failure
   */
  startScreenCapturePreview(): number {
    return this.rtcEngine.videoSourceStartPreview();
  }
  /** @zh-cn
   * 通过窗口 ID 共享窗口。
   *
   * 共享一个窗口或该窗口的部分区域。用户需要在该方法中指定想要共享的窗口 ID。
   * @param windowSymbol 指定待共享的窗口 ID
   * @param rect 可选）指定待共享的区域相对于整个窗口的位置。如不填，则表示共享整个窗口。
   * 如果设置的共享区域超出了窗口的边界，则只共享窗口内的内容；
   * 如果宽或高为 0，则共享整个窗口。详见 {@link CaptureRect}
   * @param param 屏幕共享的编码参数配置。详见 {@link CaptureParam}
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Shares the whole or part of a window by specifying the window symbol.
   *
   * @param windowSymbol The symbol of the windows to be shared.
   * @param rect (Optional) The relative location of the region to the window.
   * NULL/NIL means sharing the whole window. See {@link CaptureRect}. If the
   * specified region overruns the window, the SDK shares only the region
   * within it; if you set width or height as 0, the SDK shares the whole
   * window.
   * @param param Window sharing encoding parameters. See {@link CaptureParam}
   *
   * @return
   * - 0: Success
   * - < 0: Failure
   */
  startScreenCaptureByWindow(windowSymbol: number, rect: CaptureRect, param: CaptureParam): number {
    return this.rtcEngine.startScreenCaptureByWindow(windowSymbol, rect, param)
  }
  /** @zh-cn
   * 通过指定区域共享屏幕。
   *
   * 共享一个屏幕或该屏幕的部分区域。用户需要在该方法中指定想要共享的屏幕区域。
   *
   * @param screenSymbol 指定待共享的屏幕相对于虚拟屏的位置。详见 {@link screenSymbol}
   * @param rect (可选）指定待共享区域相对于整个屏幕屏幕的位置。如不填，则表示共享整个屏幕。
   * 如果设置的共享区域超出了屏幕的边界，则只共享屏幕内的内容；如果将 width 或 height 设为 0 ，
   * 则共享整个屏幕。详见 {@link CaptureRect}
   * @param param 屏幕共享的编码参数配置。详见 {@link CaptureParam}
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Shares the whole or part of a screen by specifying the screen symbol.
   * @param screenSymbol The screen symbol. See {@link ScreenSymbol}.
   * @param rect (Optional) The relative location of the region to the screen.
   * NULL means sharing the whole screen. See {@link CaptureRect}. If the
   * specified region overruns the screen, the SDK shares only the region
   * within it; if you set width or height as 0, the SDK shares the whole
   * screen.
   * @param param The screen sharing encoding parameters. See
   * {@link CaptureParam}
   *
   * @return
   * - 0: Success
   * - < 0: Failure
   */
  startScreenCaptureByScreen(screenSymbol: ScreenSymbol, rect: CaptureRect, param: CaptureParam): number {
    return this.rtcEngine.startScreenCaptureByScreen(screenSymbol, rect, param)
  }
  /** @zh-cn
   * 更新屏幕共享的编码参数配置。
   * @param param 屏幕共享的编码参数配置。详见 {@link CaptureParam}
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Updates the screen sharing parameters.
   *
   * @param param The screen sharing encoding parameters.
   * See {@link CaptureParam}
   *
   * @return
   * - 0: Success
   * - < 0: Failure
   */
  updateScreenCaptureParameters(param: CaptureParam): number {
    return this.rtcEngine.updateScreenCaptureParameters(param)
  }
  /** @zh-cn
   * 设置屏幕共享内容类型。
   *
   * 设置屏幕共享的内容类型。Agora SDK 会根据不同的内容类型，使用不同的算法对共享效果进行优化。
   * 如果不调用该方法，SDK 会将屏幕共享的内容默认为 CONTENT_HINT_NONE ，即无指定的内容类型。
   * @param hint 指定屏幕共享的内容类型。详见 {@link VideoContentHint}
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Sets the content hint for screen sharing.
   *
   * A content hint suggests the type of the content being shared, so that the
   * SDK applies different optimization algorithm to different types of
   * content.
   * @param hint The content hint for screen sharing.
   * See {@link VideoContentHint}
   *
   * @return
   * - 0: Success
   * - < 0: Failure
   */
  setScreenCaptureContentHint(hint: VideoContentHint): number {
    return this.rtcEngine.setScreenCaptureContentHint(hint)
  }

  /** @zh-cn
   * 双实例方法：停止预览共享屏幕。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Stops the local video preview when using the video source.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  stopScreenCapturePreview(): number {
    return this.rtcEngine.videoSourceStopPreview();
  }

  /** @zh-cn
   * 双实例方法：对屏幕共享流开启双流模式。
   * @param {boolean} enable 是否开始双流模式：
   * - true：开启双流模式
   * - false：不开双流模式（默认）
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Enables the dual-stream mode for the video source.
   * @param {boolean} enable Whether or not to enable the dual-stream mode:
   * - true: Enables the dual-stream mode.
   * - false: Disables the dual-stream mode.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  videoSourceEnableDualStreamMode(enable: boolean): number {
    return this.rtcEngine.videoSourceEnableDualStreamMode(enable);
  }

  /** @zh-cn
   * 双实例方法：通过 JSON 配置 SDK 提供技术预览或特别定制功能。
   * @param {string} parameter JSON 格式的字符串。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Sets the video source parameters.
   * @param {string} parameter Sets the video source encoding parameters.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  videoSourceSetParameters(parameter: string): number {
    return this.rtcEngine.videoSourceSetParameter(parameter);
  }

  /** @zh-cn
   * 双实例方法：更新共享区域。
   *
   * @note 设置 `rect` 时你需要注意：
   * - 如果设置的共享区域超出了窗口的边界，则只共享窗口内的内容
   * - 如果 `left` 和 `right` 值一样，即宽为 0，则共享整个窗口
   * - 如果 `top` 和 `bottom` 值一样，即高 为 0，则共享整个窗口
   *
   * @param {*} rect 共享区域相对于整个屏幕**左上角**的位置。如不填，则表示共享整个窗口。由如下参数组成：
   * @param rect.left 窗口左侧位置
   * @param rect.right 窗口右侧位置
   * @param rect.top 窗口顶部位置
   * @param rect.bottom 窗口底部位置
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Updates the screen capture region for the video source.
   * @param {*} rect {left: 0, right: 100, top: 0, bottom: 100}(relative
   * distance from the left-top corner of the screen)
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  videoSourceUpdateScreenCaptureRegion(rect: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  }) {
    return this.rtcEngine.videoSourceUpdateScreenCaptureRegion(rect);
  }
  /** @zh-cn
   * 开启声卡采集。
   *
   * 启用声卡采集功能后，声卡播放的声音会被合到本地音频流中，从而可以发送到远端。
   *
   * @note 该方法在加入频道前后都能调用。
   *
   * @param {boolean} enable 是否开启声卡采集：
   * - true：开启声卡采集
   * - false：（默认）关闭声卡采集
   *
   * @param {string|null} deviceName 声卡的设备名。
   * - 默认设为 null，即使用当前声卡采集。
   * - 如果用户使用虚拟声卡，如 Soundflower，可以将虚拟声卡名称 `"soundflower"`
   * 作为参数传入，SDK 会找到对应的虚拟声卡设备，并开始采集。**Note**: macOS 系统默认声卡
   * 不支持采集功能，如需开启此功能需要 App 自己启用一个虚拟声卡，并将该虚拟声卡的名字
   * 作为 `deviceName` 传入 SDK。 Agora 测试并推荐 soundflower 作为虚拟声卡。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /** Enables loopback audio capturing.
   *
   * If you enable loopback audio capturing, the output of the sound card is
   * mixed into the audio stream sent to the other end.
   *
   * @note You can call this method either before or after joining a channel.
   *
   * @param enable Sets whether to enable/disable loopback capturing.
   * - true: Enable loopback capturing.
   * - false: (Default) Disable loopback capturing.
   * @param deviceName The device name of the sound card. The default value
   * is NULL (the default sound card). **Note**: macOS does not support
   * loopback capturing of the default sound card.
   * If you need to use this method, please use a virtual sound card and pass
   * its name to the deviceName parameter. Agora has tested and recommends
   * using soundflower.
   *
   * @return
   * - 0: Success
   * - < 0: Failure
   */
  videoSourceEnableLoopbackRecording(enabled: boolean, deviceName: string | null = null) : number {
    return this.rtcEngine.videoSourceEnableLoopbackRecording(enabled, deviceName)
  }
  /** @zh-cn
   * 启用音频模块（默认为开启状态）。
   *
   * @note
   * - 该方法设置的是内部引擎为开启状态，在频道内和频道外均可调用，且在 {@link leaveChannel} 后仍然有效。
   * - 该方法重置整个引擎，响应速度较慢，因此 Agora 建议使用如下方法来控制音频模块：
   *
   *   - {@link enableLocalAudio}：是否启动麦克风采集并创建本地音频流
   *   - {@link muteLocalAudioStream}：是否发布本地音频流
   *   - {@link muteRemoteAudioStream}：是否接收并播放远端音频流
   *   - {@link muteAllRemoteAudioStreams}：是否接收并播放所有远端音频流
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Enables the audio module.
   *
   * The audio module is enabled by default.
   *
   * **Note**:
   * - This method affects the internal engine and can be called after calling
   * the {@link leaveChannel} method. You can call this method either before
   * or after joining a channel.
   * - This method resets the internal engine and takes some time to take
   * effect. We recommend using the following API methods to control the
   * audio engine modules separately:
   *   - {@link enableLocalAudio}: Whether to enable the microphone to create
   * the local audio stream.
   *   - {@link muteLocalAudioStream}: Whether to publish the local audio
   * stream.
   *   - {@link muteRemoteAudioStream}: Whether to subscribe to and play the
   * remote audio stream.
   *   - {@link muteAllRemoteAudioStreams}: Whether to subscribe to and play
   * all remote audio streams.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  videoSourceEnableAudio() : number {
    return this.rtcEngine.videoSourceEnableAudio()
  }
  /** @zh-cn
   * 开启或关闭内置加密。
   *
   * @since v3.2.0
   *
   * 在安全要求较高的场景下，Agora 建议你在加入频道前，调用 `enableEncryption` 方法开启内置加密。
   *
   * 同一频道内所有用户必须使用相同的加密模式和密钥。一旦所有用户都离开频道，该频道的加密密钥会自动清除。
   *
   * **Note**:
   * - 如果开启了内置加密，则不能使用 RTMP/RTMPS 推流功能。
   * - SDK 返回错误码 `-4`，当设置的加密模式不正确或加载外部加密库失败。你需检查枚举值是否正确或
   * 重新加载外部加密库。
   *
   * @param enabled 是否开启内置加密：
   * - true: 开启
   * - false: 关闭
   * @param config 配置内置加密模式和密钥。
   *
   * @return
   * - 0: 方法调用成功
   * - < 0: 方法调用失败
   */
  /** Enables/Disables the built-in encryption.
   *
   * @since v3.2.0
   *
   * In scenarios requiring high security, Agora recommends calling this
   * method to enable the built-in encryption before joining a channel.
   *
   * All users in the same channel must use the same encryption mode and
   * encryption key. Once all users leave the channel, the encryption key of
   * this channel is automatically cleared.
   *
   * **Note**:
   * - If you enable the built-in encryption, you cannot use the RTMP or
   * RTMPS streaming function.
   * - The SDK returns `-4` when the encryption mode is incorrect or
   * the SDK fails to load the external encryption library.
   * Check the enumeration or reload the external encryption library.
   *
   * @param enabled Whether to enable the built-in encryption:
   * - true: Enable the built-in encryption.
   * - false: Disable the built-in encryption.
   * @param encryptionConfig Configurations of built-in encryption schemas.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  videoSourceEnableEncryption(enabled: boolean, encryptionConfig: EncryptionConfig): number {
    return this.rtcEngine.videoSourceEnableEncryption(enabled, encryptionConfig);
  }
  /** @zh-cn
   * 设置内置的加密方案。
   *
   * @deprecated 该方法自 v3.2.0 废弃，请改用 {@link videoSourceEnableEncryption}。
   *
   * Agora Native SDK 支持内置加密功能，默认使用 AES-128-XTS 加密方式。如需使用其他加密方式，可以调用该 API 设置。
   *
   * 同一频道内的所有用户必须设置相同的加密方式和密码才能进行通话。关于这几种加密方式的区别，请参考 AES 加密算法的相关资料。
   *
   * @note 调用本方法前，请先调用 {@link setEncryptionSecret} 方法启用内置加密功能。
   *
   * @param mode 加密方式。目前支持以下几种：
   * - "aes-128-xts"：128 位 AES 加密，XTS 模式
   * - "aes-128-ecb"：128 位 AES 加密，ECB 模式
   * - "aes-256-xts"：256 位 AES 加密，XTS 模式
   * - ""：设置为空字符串时，默认使用加密方式 aes-128-xts
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /* @deprecated This method is deprecated from v3.2.0. Use the
   * {@link videoSourceEnableEncryption} method instead.
   *
   * Sets the built-in encryption mode.
   *
   * @param encryptionMode The set encryption mode:
   * - `"aes-128-xts"`: (Default) 128-bit AES encryption, XTS mode.
   * - `"aes-128-ecb"`: 128-bit AES encryption, ECB mode.
   * - `"aes-256-xts"`: 256-bit AES encryption, XTS mode.
   * - `""`: The encryption mode is set as `"aes-128-xts"` by default.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  videoSourceSetEncryptionMode(mode: string): number {
    return this.rtcEngine.videoSourceSetEncryptionMode(mode);
  }
  /** @zh-cn
   * @deprecated 该方法自 v3.2.0 起废弃。请改用 {@link enableEncryption} 方法。
   *
   * 启用内置加密，并设置数据加密密码。
   *
   * 如需启用加密，请在 {@link joinChannel} 前调用该方法，并设置加密的密码。
   * 同一频道内的所有用户应设置相同的密码。当用户离开频道时，该频道的密码会自动清除。如果未指定密码或将密码设置为空，则无法激活加密功能。
   *
   * @note 为保证最佳传输效果，请确保加密后的数据大小不超过原始数据大小 + 16 字节。16 字节是 AES 通用加密模式下最大填充块大小。
   *
   * @param {string} secret 加密密码
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /** Enables built-in encryption with an encryption password before users
   * join a channel.
   *
   * @deprecated This method is deprecated from v3.2.0. Use the
   * {@link videoSourceEnableEncryption} method instead.
   *
   * @param secret The encryption password.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  videoSourceSetEncryptionSecret(secret: string): number {
    return this.rtcEngine.videoSourceSetEncryptionSecret(secret);
  }

  /** @zh-cn
   * 双实例方法：释放 `videoSource` 对象。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Releases the video source object.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  videoSourceRelease(): number {
    return this.rtcEngine.videoSourceRelease();
  }

  // 2.4 new Apis
  /** @zh-cn
   * 双实例方法：通过**屏幕**信息共享屏幕。
   *
   * @note 设置 `rect` 时你需要注意：
   * - 如果设置的共享区域超出了窗口的边界，则只共享窗口内的内容
   * - 如果 `width` 或 `height` 为 0，则共享整个窗口
   *
   * @param {ScreenSymbol} screenSymbol 屏幕标识：
   * - macOS 系统：屏幕 ID
   * - Windows 系统：屏幕位置
   * @param {CaptureRect} rect （可选）共享区域相对于整个屏幕**左上角**的位置。如不填，则表示共享整个屏幕。
   * @param {CaptureParam} param 屏幕共享的编码配置
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Shares the whole or part of a screen by specifying the screen rect.
   * @param {ScreenSymbol} screenSymbol The display ID：
   * - macOS: The display ID.
   * - Windows: The screen rect.
   * @param {CaptureRect} rect Sets the relative location of the region
   * to the screen.
   * @param {CaptureParam} param Sets the video source encoding parameters.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  videoSourceStartScreenCaptureByScreen(
    screenSymbol: ScreenSymbol,
    rect: CaptureRect,
    param: CaptureParam
  ): number {
    return this.rtcEngine.videosourceStartScreenCaptureByScreen(
      screenSymbol,
      rect,
      param
    );
  }

  /** @zh-cn
   * 双实例方法：通过**窗口**信息共享屏幕。
   *
   * @note 设置 `rect` 时你需要注意：
   * - 如果设置的共享区域超出了窗口的边界，则只共享窗口内的内容
   * - 如果 `width` 或 `height` 为 0，则共享整个窗口
   *
   * @param {number} windowSymbol 窗口 ID
   * @param {CaptureRect} rect （可选）共享区域相对于整个窗口**左上角**的位置。如不填，则表示共享整个窗口。
   * @param {CaptureParam} param 屏幕共享的编码配置
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Shares the whole or part of a window by specifying the window ID.
   * @param {number} windowSymbol The ID of the window to be shared.
   * @param {CaptureRect} rect The ID of the window to be shared.
   * @param {CaptureParam} param Sets the video source encoding parameters.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  videoSourceStartScreenCaptureByWindow(
    windowSymbol: number,
    rect: CaptureRect,
    param: CaptureParam
  ): number {
    return this.rtcEngine.videosourceStartScreenCaptureByWindow(
      windowSymbol,
      rect,
      param
    );
  }

  /** @zh-cn
   * 双实例方法：更新共享屏幕的编码配置。
   *
   * @param {CaptureParam} param 共享屏幕的编码配置
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Updates the video source parameters.
   * @param {CaptureParam} param Sets the video source encoding parameters.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  videoSourceUpdateScreenCaptureParameters(param: CaptureParam): number {
    return this.rtcEngine.videosourceUpdateScreenCaptureParameters(param);
  }

  /** @zh-cn
   * 双实例方法：设置共享屏幕的内容类型。
   *
   * Agora SDK 会根据不同的内容类型，使用不同的算法对共享效果进行优化。
   * 如果不调用该方法，SDK 会将屏幕共享的内容默认为 `CONTENT_HINT_NONE (0)`，即无指定的内容类型。
   *
   * @param {VideoContentHint} hint 共享屏幕的内容类型
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   *  Updates the video source parameters.
   * @param {VideoContentHint} hint Sets the content hint for the video source.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  videoSourceSetScreenCaptureContentHint(hint: VideoContentHint): number {
    return this.rtcEngine.videosourceSetScreenCaptureContentHint(hint);
  }

  // ===========================================================================
  // SCREEN SHARE
  // When this api is called, your camera stream will be replaced with
  // screenshare view. i.e. you can only see camera video or screenshare
  // one at a time via this section's api
  // ===========================================================================
  /** @zh-cn
   * 通过窗口信息共享屏幕
   *
   * @deprecated 该方法已废弃，请改用 {@link startScreenCaptureByWindow} 方法。
   *
   * 共享一个窗口或该窗口的部分区域。你需要在该方法中指定想要共享的窗口 ID。
   *
   * @note 设置 `rect` 时你需要注意：
   * - 如果设置的共享区域超出了窗口的边界，则只共享窗口内的内容
   * - 如果 `left` 和 `right` 值一样，即宽为 0，则共享整个窗口
   * - 如果 `top` 和 `bottom` 值一样，即高 为 0，则共享整个窗口
   *
   * @param {number} windowId 待共享的窗口 ID
   * @param {number} captureFreq 共享视频的编码帧率（fps）。默认值为 5，建议不要超过 15
   * @param {*} rect （可选）共享区域相对于整个屏幕**左上角**的位置。如不填，则表示共享整个窗口。由如下参数组成：
   * @param rect.left 窗口左侧位置
   * @param rect.right 窗口右侧位置
   * @param rect.top 窗口顶部位置
   * @param rect.bottom 窗口底部位置
   * @param {number} bitrate 共享视频的码率（Kbps）；默认值为 0，表示由 SDK 根据当前共享的分辨率计算出一个合理的值
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Starts the screen sharing.
   *
   * @deprecated This method is deprecated. Use
   * {@link startScreenCaptureByWindow} instead.
   *
   * @param {number} wndid Sets the screen sharing area.
   * @param {number} captureFreq (Mandatory) The captured frame rate. The
   * value ranges between 1 fps and 15 fps.
   * @param {*} rect Specifies the screen sharing region. `rect` is valid
   * when `wndid` is set as 0. When `rect` is set as NULL, the whole screen
   * is shared.
   * @param {number} bitrate The captured bitrate.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  startScreenCapture(
    windowId: number,
    captureFreq: number,
    rect: { left: number; right: number; top: number; bottom: number },
    bitrate: number
  ): number {
    deprecate();
    return this.rtcEngine.startScreenCapture(
      windowId,
      captureFreq,
      rect,
      bitrate
    );
  }

  /** @zh-cn
   * 停止共享屏幕。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Stops screen sharing.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  stopScreenCapture(): number {
    return this.rtcEngine.stopScreenCapture();
  }

  /** @zh-cn
   * 更新共享区域。
   *
   * @note 设置 `rect` 时你需要注意：
   * - 如果设置的共享区域超出了窗口的边界，则只共享窗口内的内容
   * - 如果 `left` 和 `right` 值一样，即宽为 0，则共享整个窗口
   * - 如果 `top` 和 `bottom` 值一样，即高 为 0，则共享整个窗口
   *
   * @param {*} rect 共享区域相对于整个屏幕**左上角**的位置。如不填，则表示共享整个窗口。由如下参数组成：
   * @param rect.left 窗口左侧位置
   * @param rect.right 窗口右侧位置
   * @param rect.top 窗口顶部位置
   * @param rect.bottom 窗口底部位置
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Updates the screen capture region.
   * @param {*} rect {left: 0, right: 100, top: 0, bottom: 100}(relative
   * distance from the left-top corner of the screen)
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  updateScreenCaptureRegion(rect: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  }): number {
    return this.rtcEngine.updateScreenCaptureRegion(rect);
  }

  // ===========================================================================
  // AUDIO MIXING
  // ===========================================================================
  /** @zh-cn
   * 开始播放音乐文件及混音。
   *
   * 该方法指定本地或在线音频文件来和麦克风采集的音频流进行混音或替换。替换是指用音频文件替换麦克风采集的音频流。该方法可以选择是否让对方听到本地播放的音频，并指定循环播放的次数。
   * 音乐文件开始播放后，本地会收到 `audioMixingStateChanged` 回调，报告音乐文件播放状态发生改变。
   * @param {string} filepath 指定需要混音的本地或在线音频文件的绝对路径（包含文件后缀名）。支持的音频格式包括：mp3、mp4、m4a、aac、3gp、mkv 及 wav
   * @param {boolean} loopback
   * - `true`：只有本地可以听到混音或替换后的音频流
   * - `false`：本地和对方都可以听到混音或替换后的音频流
   * @param {boolean} replace
   * - `true`：只推动设置的本地音频文件或者线上音频文件，不传输麦克风收录的音频
   * - `false`：音频文件内容将会和麦克风采集的音频流进行混音
   * @param {number} cycle 指定音频文件循环播放的次数：
   * - 正整数：循环的次数
   * - `-1`：无限循环
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   *
   */
  /**
   * Starts playing and mixing the music file.
   *
   * This method mixes the specified local audio file with the audio stream
   * from the microphone, or replaces the microphone’s audio stream with the
   * specified
   * local audio file. You can choose whether the other user can hear the
   * local audio playback
   * and specify the number of loop playbacks. This API also supports online
   * music playback.
   *
   * The SDK returns the state of the audio mixing file playback in the
   * audioMixingStateChanged callback.
   *
   * **Note**:
   * - Call this method when you are in the channel, otherwise it may cause
   * issues.
   * - If the local audio mixing file does not exist, or if the SDK does not
   * support the file format
   * or cannot access the music file URL, the SDK returns the warning code 701.
   *
   * @param {string} filepath Specifies the absolute path (including the
   * suffixes of the filename) of the local or online audio file to be mixed.
   * Supported audio formats: mp3, mp4, m4a, aac, 3gp, mkv and wav.
   * @param {boolean} loopback Sets which user can hear the audio mixing:
   * - true: Only the local user can hear the audio mixing.
   * - false: Both users can hear the audio mixing.
   * @param {boolean} replace Sets the audio mixing content:
   * - true: Only publish the specified audio file; the audio stream from the
   * microphone is not published.
   * - false: The local audio file is mixed with the audio stream from the
   * microphone.
   * @param {number} cycle Sets the number of playback loops:
   * - Positive integer: Number of playback loops.
   * - -1: Infinite playback loops.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  startAudioMixing(
    filepath: string,
    loopback: boolean,
    replace: boolean,
    cycle: number
  ): number {
    return this.rtcEngine.startAudioMixing(filepath, loopback, replace, cycle);
  }

  /** @zh-cn
   * 停止播放音乐文件及混音。请在频道内调用该方法。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Stops playing or mixing the music file.
   *
   * Call this API when you are in a channel.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  stopAudioMixing(): number {
    return this.rtcEngine.stopAudioMixing();
  }

  /** @zh-cn
   * 暂停播放音乐文件及混音。请在频道内调用该方法。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Pauses playing and mixing the music file.
   *
   *  Call this API when you are in a channel.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  pauseAudioMixing(): number {
    return this.rtcEngine.pauseAudioMixing();
  }

  /** @zh-cn
   * 恢复播放音乐文件及混音。请在频道内调用该方法。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Resumes playing and mixing the music file.
   *
   *  Call this API when you are in a channel.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  resumeAudioMixing(): number {
    return this.rtcEngine.resumeAudioMixing();
  }

  /** @zh-cn
   *
   * 调节音乐文件的播放音量。
   *
   * @note
   * - 请在频道内调用该方法。
   * - 调用该方法不影响调用 {@link playEffect} 播放音效文件的音量。
   *
   * @param {number} volume 音乐文件播放音量，取值范围为 [0, 100]，默认值为 100，表示原始文件音量
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Adjusts the volume of audio mixing.
   *
   * Call this API when you are in a channel.
   *
   * **Note**: Calling this method does not affect the volume of audio effect
   * file playback invoked by the playEffect method.
   * @param {number} volume Audio mixing volume. The value ranges between 0
   * and 100 (default). 100 is the original volume.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  adjustAudioMixingVolume(volume: number): number {
    return this.rtcEngine.adjustAudioMixingVolume(volume);
  }

  /** @zh-cn
   * 调节音乐文件的本地播放音量。
   *
   * @note 请在频道内调用该方法。
   *
   * @param {number} volume 音乐文件的本地播放音量，取值范围为 [0, 100]，默认值为 100，表示原始文件音量
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Adjusts the audio mixing volume for local playback.
   * @param {number} volume Audio mixing volume for local playback. The value
   * ranges between 0 and 100 (default). 100 is the original volume.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  adjustAudioMixingPlayoutVolume(volume: number): number {
    return this.rtcEngine.adjustAudioMixingPlayoutVolume(volume);
  }

  /** @zh-cn
   * 调节音乐文件的远端播放音量。
   *
   * @note 请在频道内调用该方法。
   *
   * @param {number} volume 音乐文件的远端播放音量，取值范围为 [0, 100]，默认值为 100，表示原始文件音量
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Adjusts the audio mixing volume for publishing (sending to other users).
   * @param {number} volume Audio mixing volume for publishing. The value
   * ranges between 0 and 100 (default). 100 is the original volume.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  adjustAudioMixingPublishVolume(volume: number): number {
    return this.rtcEngine.adjustAudioMixingPublishVolume(volume);
  }

  /** @zh-cn
   * 获取音乐文件的时长。
   *
   * @note
   * - 该方法获取音乐文件总时长，单位为毫秒。
   * - 请在频道内调用该方法。
   *
   * @returns {number}
   * - &ge; 0：方法调用成功，返回音乐文件时长。
   * - < 0：方法调用失败。
   */
  /**
   * Gets the duration (ms) of the music file.
   *
   * Call this API when you are in a channel.
   * @return
   * - ≥ 0: The audio mixing duration, if this method call succeeds.
   * - < 0: Failure.
   */
  getAudioMixingDuration(): number {
    return this.rtcEngine.getAudioMixingDuration();
  }

  /** @zh-cn
   * 获取音乐文件的播放进度。
   *
   * @note
   * - 播放进度的单位为毫秒。
   * - 请在频道内调用该方法。
   *
   * @returns {number}
   * - < 0：方法调用失败
   * - 其他值：方法调用成功并返回伴奏播放进度
   */
  /**
   * Gets the playback position (ms) of the music file.
   *
   * Call this API when you are in a channel.
   * @return
   * - ≥ 0: The current playback position of the audio mixing, if this method
   * call succeeds.
   * - < 0: Failure.
   */
  getAudioMixingCurrentPosition(): number {
    return this.rtcEngine.getAudioMixingCurrentPosition();
  }


  /** @zh-cn
   * 获取音乐文件的本地播放音量。
   *
   * 该方法获取混音的音乐文件本地播放音量，方便排查音量相关问题。
   *
   * @note 请在频道内调用该方法。
   *
   * @return
   * - &ge; 0：方法调用成功则返回音量值，范围为 [0,100]
   * - < 0：方法调用失败
   */
  /**
   * Adjusts the audio mixing volume for publishing (for remote users).
   *
   * Call this API when you are in a channel.
   *
   * @return
   * - &ge;: The audio mixing volume for local playout, if this method call
   succeeds. The value range is [0,100].
   * - < 0: Failure.
   */
  getAudioMixingPlayoutVolume(): number {
    return this.rtcEngine.getAudioMixingPlayoutVolume();
  }

  /** @zh-cn
   * 调节音乐文件远端播放音量。
   *
   * 该方法调节混音音乐文件在远端的播放音量大小。
   *
   * @note
   * - 请在频道内调用该方法。
   * - 音乐文件音量范围为 0~100。100 （默认值） 为原始文件音量。
   *
   * @return
   * - &ge; 方法调用成功则返回音量值
   * - < 0 方法调用失败
   */
  /**
   * Retrieves the audio mixing volume for publishing.
   *
   * Call this API when you are in a channel.
   *
   * @note The value range of the audio mixing volume is [0,100].
   *
   * @return
   * - &ge;: The audio mixing volume for publishing, if this method call
   succeeds. The value range is [0,100].
   * - < 0: Failure.
   */
  getAudioMixingPublishVolume(): number {
    return this.rtcEngine.getAudioMixingPublishVolume();
  }

  /** @zh-cn
   * 设置音乐文件的播放位置。
   *
   * 该方法可以设置音频文件的播放位置，这样你可以根据实际情况播放文件，而不是非得从头到尾播放一个文件。
   *
   * @param {number} position 当前播放进度，单位为毫秒
   * @returns
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Sets the playback position of the music file to a different starting
   * position.
   *
   * This method drags the playback progress bar of the audio mixing file to
   * where
   * you want to play instead of playing it from the beginning.
   * @param {number} position The playback starting position (ms) of the music
   * file.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setAudioMixingPosition(position: number): number {
    return this.rtcEngine.setAudioMixingPosition(position);
  }
  /** @zh-cn
   * 调整本地播放的音乐文件的音调。
   *
   * @since v3.2.0
   *
   * 本地人声和播放的音乐文件混音时，调用该方法可以仅调节音乐文件的音调。
   *
   * @note 调用该方法前，请确保你已调用 {@link startAudioMixing}。
   *
   * @param pitch 按半音音阶调整本地播放的音乐文件的音调，默认值为 0，即不调整音调。
   * 取值范围为 [-12,12]，每相邻两个值的音高距离相差半音。取值的绝对值越大，音调升高或降低得越多。
   *
   * @return
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /** Sets the pitch of the local music file.
   *
   * @since v3.2.0
   *
   * When a local music file is mixed with a local human voice, call this
   * method to set the pitch of the local music file only.
   *
   * @note Call this method after calling {@link startAudioMixing}.
   *
   * @param pitch Sets the pitch of the local music file by chromatic scale.
   * The default value is 0,
   * which means keeping the original pitch. The value ranges from -12 to 12,
   * and the pitch value between
   * consecutive values is a chromatic value. The greater the absolute value
   * of this parameter, the
   * higher or lower the pitch of the local music file.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setAudioMixingPitch(pitch: number): number {
    return this.rtcEngine.setAudioMixingPitch(pitch);
  }

  // ===========================================================================
  // CDN STREAMING
  // ===========================================================================
  /** @zh-cn
   * 增加旁路推流地址。
   *
   * 调用该方法后，SDK 会在本地触发 streamPublished 回调，报告增加旁路推流地址的状态。
   *
   * @note
   * - 该方法仅适用于直播场景下的主播，请在加入频道后调用该方法。
   * - 确保已开通旁路推流的功能，详见《推流到 CDN》的 “前提条件”。
   * - 该方法每次只能增加一路旁路推流地址。若需推送多路流，则需多次调用该方法。
   *
   * @param {string} url CDN 推流地址，格式为 RTMP。该字符长度不能超过 1024 字节，且不支持中文等特殊字符。
   * @param {bool} transcodingEnabled 设置是否转码：
   * - true: 转码。[转码](https://docs.agora.io/cn/Agora%20Platform/terms?platform=All%20Platforms#转码)是指在旁路推流时对音视频流进行转码处理后，
   * 再推送到其他 RTMP 服务器。多适用于频道内有多个主播，需要进行混流、合图的场景。如果设为 `true`，需先调用 {@link setLiveTranscoding} 方法。
   * - false: 不转码。
   * @returns
   * - 0：方法调用成功
   * - < 0：方法调用失败
   *  - `ERR_INVALID_ARGUMENT (2)`: RTMP 流地址为空或者字符长度为 0。
   *  - `ERR_NOT_INITIALIZED (7)`: 使用该功能之前没有初始化 `AgoraRtcChannel`。
   */
   /**
    * Publishes the local stream to a specified CDN live RTMP address.
    *
    * The SDK returns the result of this method call in the streamPublished
    * callback.
    *
    * @note
    * - Only the host in the `1` (live streaming) profile can call this
    * method.
    * - Call this method after the host joins the channel.
    * - Ensure that you enable the RTMP Converter service before using this
    * function. See *Prerequisites* in the *Push Streams to CDN* guide.
    * - This method adds only one stream URL address each time it is
    * called.
    *
    * @param {string} url The CDN streaming URL in the RTMP format. The
    * maximum length of this parameter is 1024 bytes. The RTMP URL address must
    * not contain special characters, such as Chinese language characters.
    * @param {bool} transcodingEnabled Sets whether transcoding is
    * enabled/disabled:
    * - true: Enable transcoding. To transcode the audio or video streams when
    * publishing them to CDN live,
    * often used for combining the audio and video streams of multiple hosts
    * in CDN live. If set the parameter as `true`, you should call the
    * {@link setLiveTranscoding} method before this method.
    * - false: Disable transcoding.
    * @return
    * - 0: Success.
    * - < 0: Failure.
    */
  addPublishStreamUrl(url: string, transcodingEnabled: boolean): number {
    return this.rtcEngine.addPublishStreamUrl(url, transcodingEnabled);
  }

  /** @zh-cn
   * 删除旁路推流地址。
   *
   * 调用该方法后，SDK 会在本地触发 `streamUnpublished` 回调，报告删除旁路推流地址的状态。
   *
   * @note
   * - 该方法只适用于直播场景下的主播。
   * - 该方法每次只能删除一路旁路推流地址。若需删除多路流，则需多次调用该方法。
   * - 推流地址不支持中文等特殊字符。
   * @param {string} url 待删除的推流地址，格式为 RTMP。该字符长度不能超过 1024 字节。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Removes an RTMP stream from the CDN.
   * @note
   * - Only the host in the `1` (live streaming) profile can call this
   * method.
   * - This method removes only one RTMP URL address each time it is called.
   * - The RTMP URL address must not contain special characters, such as
   * Chinese language characters.
   * @param {string} url The RTMP URL address to be removed. The maximum
   * length of this parameter is 1024 bytes.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  removePublishStreamUrl(url: string): number {
    return this.rtcEngine.removePublishStreamUrl(url);
  }

  /** @zh-cn
   * 设置直播转码。
   *
   * 调用该方法更新 `transcoding` 参数时，SDK 会触发 `transcodingUpdated` 回调。
   *
   * @note
   * - 该方法只适用于直播场景下的主播。
   * - 请确保已开通旁路推流的功能，详见《推流到 CDN》文档中的 “前提条件”。
   * - 首次调用 {@link setLiveTranscoding} 方法设置 `transcoding` 时，不会触发该回调。
   *
   * @param {TranscodingConfig} transcoding 旁路推流转码合图相关设置
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Sets the video layout and audio settings for CDN live. (CDN live only)
   *
   * The SDK triggers the otranscodingUpdated callback when you call the
   * {@link setLiveTranscoding} method to update the LiveTranscoding class.
   *
   * @note
   * - Only the host in the Live-broadcast porfile can call this method.
   * - Ensure that you enable the RTMP Converter service before using
   * this function. See *Prerequisites* in the *Push Streams to CDN* guide.
   * - If you call the {@link setLiveTranscoding} method to set the
   * LiveTranscoding class for the first time, the SDK does not trigger the
   * transcodingUpdated callback.
   *
   * @param {TranscodingConfig} transcoding Sets the CDN live audio/video
   * transcoding settings. See {@link TranscodingConfig}.
   *
   *
   * @return {number}
   * - 0: Success.
   * - < 0: Failure.
   */
  setLiveTranscoding(transcoding: TranscodingConfig): number {
    return this.rtcEngine.setLiveTranscoding(transcoding);
  }

  // ===========================================================================
  // STREAM INJECTION
  // ===========================================================================
  /** @zh-cn
   * 输入在线媒体流。
   *
   * 该方法适用于 Native SDK v2.4.1 及之后的版本。
   *
   * 该方法通过在服务端拉取一路视频流并发送到频道中，将正在播出的视频输入到正在进行的直播中。
   * 可主要应用于赛事直播、多人看视频互动等直播场景。
   *
   * 调用该方法后，SDK 会在本地触发 `streamInjectStatus` 回调，报告导入在线媒体流的状态。
   * 成功导入媒体流后，该音视频流会出现在频道中，频道内所有用户都会收到 `userJoined` 回调，其中 `uid` 为 666。
   *
   * @warning 客户端输入在线媒体流功能即将停服。如果你尚未集成该功能，Agora 建议你不要使用。详见《部分服务下架计划》。
   *
   * @note
   * - 该方法只适用于直播场景下的主播。
   * - 调用该方法前，请确保已开通旁路推流的功能，详见《推流到 CDN》文档中的 “前提条件”。
   * - 请确保在成功加入频道后再调用该接口。
   * - 该方法每次只能增加一路媒体流地址。若需输多路流，则需多次调用该方法。
   *
   * @param url 添加到直播中的媒体流 URL 地址，支持 RTMP， HLS， HTTP-FLV 协议。
   * - 支持的 FLV 音频编码格式：AAC
   * - 支持的 FLV 视频编码格式：H264 (AVC)
   * @param config 外部导入的媒体流的配置。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   *  - `2`: 输入的 URL 为空。请重新调用该方法，并确认输入的媒体流的 URL 是有效的。
   *  - `7`: 引擎没有初始化。请确认调用该方法前已创建 `AgoraRtcEngine` 对象并完成初始化。
   *  - `4`: 频道非直播场景。请调用 {@link setChannelProfile} 并将频道设置为直播场景再调用该方法。
   *  - `3`: 用户没有加入频道。
   */
  /**
   * Injects the online media stream to a live broadcast.
   *
   * If this method call is successful, the server pulls the voice or video
   * stream and injects it into a live channel. And all audience members in the
   * channel can watch a live show and interact with each other.
   *
   * This method call triggers the following callbacks:
   * - The local client:
   *  - `streamInjectedStatus`, reports the injecting status.
   *  - `userJoined`(uid:666), reports the stream is injected successfully and
   * the UID of this stream is 666.
   * - The remote client:
   *  - `userJoined`(uid:666), reports the stream is injected successfully and
   * the UID of this stream is 666.
   *
   * @warning Agora will soon stop the service for injecting online media
   * streams on the client. If you have not implemented this service, Agora
   * recommends that you do not use it.
   *
   * @note
   * - Only the host in the Live-braodcast profile can call this method.
   * - Ensure that you enable the RTMP Converter service before using this
   * function. See *Prerequisites* in the *Push Streams to CDN* guide.
   * - Ensure that the user joins a channel before calling this method.
   * - This method adds only one stream URL address each time it is called.
   *
   * @param url The URL address to be added to the ongoing live broadcast.
   * Valid protocols are RTMP, HLS, and HTTP-FLV.
   * - Supported audio codec type: AAC.
   * - Supported video codec type: H264 (AVC).
   * @param config The configuration of the injected stream.
   * See InjectStreamConfig
   *
   * @param {string} url The HTTP/HTTPS URL address to be added to the ongoing
   * live streaming. Valid protocols are RTMP, HLS, and FLV.
   * - Supported FLV audio codec type: AAC.
   * - Supported FLV video codec type: H264 (AVC).
   * @param {InjectStreamConfig} config The InjectStreamConfig object which
   * contains the configuration information for the added voice or video stream.
   * @return
   * - 0: Success
   * - < 0: Failure
   *  - ERR_INVALID_ARGUMENT (2): The injected URL does not exist. Call this
   * method again to inject the stream and ensure that the URL is valid.
   *  - ERR_NOT_READY (3): The user is not in the channel.
   *  - ERR_NOT_SUPPORTED (4): The channel profile is not live broadcast.
   * Call the {@link setChannelProfile} method and set the channel profile to
   * live broadcast before calling this method.
   *  - ERR_NOT_INITIALIZED (7): The SDK is not initialized. Ensure that the
   * `AgoraRtcE` object is initialized before calling this method.
   *  - `ERR_NOT_READY (3)`: The user is not in the channel.
   *  - `ERR_NOT_SUPPORTED (4)`: The channel profile is not Live streaming.
   * Call the {@link setChannelProfile} method and set the channel profile to
   * Live streaming before calling this method.
   *  - `ERR_NOT_INITIALIZED (7)`: The SDK is not initialized. Ensure that
   * the `AgoraRtcEngine` object is initialized before using this method.
   */
  addInjectStreamUrl(url: string, config: InjectStreamConfig): number {
    return this.rtcEngine.addInjectStreamUrl(url, config);
  }

  /** @zh-cn
   * 删除输入的在线媒体流。
   *
   * 成功删除后，会触发 `removeStream` 回调，其中 `uid` 为 `666`
   *
   * @waning 客户端输入在线媒体流功能即将停服。如果你尚未集成该功能，Agora 建议你不要使用。详见《部分服务下架计划》。
   *
   * @param {string} url 已导入、待删除的外部视频流 URL 地址
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Removes the injected online media stream from a live streaming.
   *
   * @warning Agora will soon stop the service for injecting online media
   * streams on the client. If you have not implemented this service, Agora
   * recommends that you do not use it.
   *
   * @param {string} url HTTP/HTTPS URL address of the added stream to be
   * removed.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  removeInjectStreamUrl(url: string): number {
    return this.rtcEngine.removeInjectStreamUrl(url);
  }


  // ===========================================================================
  // DATA CHANNEL
  // ===========================================================================
  /** @zh-cn
   * 创建数据流。
   *
   * 该方法用于创建数据流。`AgoraRtcEngine` 生命周期内，每个用户最多只能创建 5 个数据流。
   *
   * @note
   * - 频道内数据通道最多允许数据延迟 5 秒，若超过 5 秒接收方尚未收到数据流，则数据通道会向 App 报错。
   * - 请将 `reliable` 和 `ordered` 同时设置为 `true` 或 `false`，暂不支持交叉设置。
   *
   * @param {boolean} reliable
   * - `true`：接收方 5 秒内会收到发送方所发送的数据，否则会收到 `streamMessageError` 回调并获得相应报错信息
   * - `false`：接收方不保证收到，就算数据丢失也不会报错
   * @param {boolean} ordered
   * - `true`：接收方 5 秒内会按照发送方发送的顺序收到数据包
   * - `false`：接收方不保证按照发送方发送的顺序收到数据包
   * @returns {number}
   * - 创建数据流成功则返回数据流 ID
   * - < 0：创建数据流失败。如果返回的错误码是负数，对应错误代码和警告代码里的正整数
   */
  /**
   * Creates a data stream.
   *
   * Each user can create up to five data streams during the lifecycle of the
   * AgoraRtcEngine.
   *
   * @deprecated This method is deprecated from v3.3.1. Use the
   * {@link createDataStreamWithConfig} method instead.
   *
   * **Note**:
   * Set both the `reliable` and `ordered` parameters to true or false. Do not
   * set one as true and the other as false.
   * @param {boolean} reliable Sets whether or not the recipients are
   * guaranteed to receive the data stream from the sender within five seconds:
   * - true: The recipients will receive data from the sender within 5 seconds.
   * If the recipient does not receive the sent data within 5 seconds, the data
   * channel will report an error to the application.
   * - false: There is no guarantee that the recipients receive the data stream
   * within five seconds and no error message is reported for any delay or
   * missing data stream.
   * @param {boolean} ordered Sets whether or not the recipients receive the
   * data stream in the sent order:
   * - true: The recipients receive the data stream in the sent order.
   * - false: The recipients do not receive the data stream in the sent order.
   * @return
   * - Returns the ID of the data stream, if this method call succeeds.
   * - < 0: Failure and returns an error code.
   */
  createDataStream(reliable: boolean, ordered: boolean): number {
    return this.rtcEngine.createDataStream(reliable, ordered);
  }
  /** Creates a data stream.
   *
   * @since v3.3.1
   *
   * Each user can create up to five data streams in a single channel.
   *
   * This method does not support data reliability. If the receiver receives
   * a data packet five
   * seconds or more after it was sent, the SDK directly discards the data.
   *
   * @param config The configurations for the data stream.
   *
   * @return
   * - Returns the ID of the created data stream, if this method call succeeds.
   * - < 0: Fails to create the data stream.
   */
  createDataStreamWithConfig(config: DataStreamConfig): number {
    return this.rtcEngine.createDataStream(config);
  }

  /** @zh-cn
   * 发送数据流。
   *
   * 该方法发送数据流消息到频道内所有用户。
   *
   * SDK 对该方法的实现进行了如下限制：频道内每秒最多能发送 30 个包，且每个包最大为 1 KB。 每个客户端每秒最多能发送 6 KB 数据。频道内每人最多能同时有 5 个数据通道。
   *
   * 成功调用该方法后，远端会触发 `streamMessage` 回调，远端用户可以在该回调中获取接收到的流消息；
   * 若调用失败，远端会触发 `streamMessageError` 回调。
   *
   * @note
   * - 该方法仅适用于通信场景以及直播场景下的主播用户，如果直播场景下的观众调用此方法可能会造成观众变主播。
   * - 请确保在调用该方法前，已调用 {@link createDataStream} 创建了数据通道。
   * @param {number} streamId 数据流 ID，{@link createDataStream} 的返回值
   * @param {string} msg 待发送的数据
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Sends data stream messages to all users in a channel.
   *
   * The SDK has the following restrictions on this method:
   * - Up to 30 packets can be sent per second in a channel with each packet
   * having a maximum size of 1 kB.
   * - Each client can send up to 6 kB of data per second.
   * - Each user can have up to five data streams simultaneously.
   *
   * A successful {@link sendStreamMessage} method call triggers the
   * streamMessage callback on the remote client, from which the remote user
   * gets the stream message.
   *
   * A failed {@link sendStreamMessage} method call triggers the
   * streamMessageError callback on the remote client.
   *
   * @note
   * This method applies only to the communication(`0`) profile or to the hosts in
   * the `1` (live streaming) profile.
   * If an audience in the `1` (live streaming) profile calls this method, the
   * audience may be switched to a host.
   * @param {number} streamId ID of the sent data stream, returned in the
   * {@link createDataStream} method.
   * @param {string} msg Data to be sent.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  sendStreamMessage(streamId: number, msg: string): number {
    return this.rtcEngine.sendStreamMessage(streamId, msg);
  }

  // ===========================================================================
  // CHANNEL MEDIA RELAY
  // ===========================================================================
  /** @zh-cn
   * 开始跨频道媒体流转发。
   *
   * 该方法可用于实现跨频道连麦等场景。
   *
   * 成功调用该方法后，SDK 会触发 `channelMediaRelayState` 和 `channelMediaRelayEvent`
   * 回调，并在回调中报告当前的跨频道媒体流转发状态和事件。
   * - 如果 `channelMediaRelayState` 回调报告 {@link ChannelMediaRelayState} 中的
   * 状态码 `1` 和 {@link ChannelMediaRelayError} 中错误码为 `0`，且 `channelMediaRelayEvent` 回调报告
   * {@link ChannelMediaRelayEvent} 中的事件码 `4`，则表示 SDK 开始在源频道和目标频道
   * 之间转发媒体流。
   * - 如果 `channelMediaRelayState` 回调报告 {@link ChannelMediaRelayState} 中的
   * 状态码 `3`，则表示跨频道媒体流转发出现异常。
   *
   * @note
   * - 该功能需要联系 sales@agora.io 开通。
   * - 请在成功加入频道后调用该方法。
   * - 该方法仅对直播场景下的主播有效。
   * - 该功能不支持使用 String 型 `uid`。
   * - 成功调用该方法后，若你想再次调用该方法，必须先调用
   * {@link stopChannelMediaRelay} 方法退出当前的转发状态。
   *
   * @param config 跨频道媒体流转发参数配置
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Starts to relay media streams across channels.
   *
   * After a successful method call, the SDK triggers the
   * channelMediaRelayState and channelMediaRelayEvent callbacks,
   * and these callbacks report the states and events of the media stream
   * relay.
   *
   * - If the channelMediaRelayState callback reports the state code `1` and
   * the error code `0`, and the and the
   * `channelMediaRelayEvent`
   * callback reports the event code `4` in {@link ChannelMediaRelayEvent}, the
   * SDK starts relaying media streams between the original and the
   * destination channel.
   * - If the channelMediaRelayState callback  reports the state code `3` in
   * {@link ChannelMediaRelayState}, an exception occurs during the media
   * stream relay.
   *
   * @note
   * - Contact sales-us@agora.io before implementing this function.
   * - Call this method after the {@link joinChannel} method.
   * - This method takes effect only when you are a host in a
   * Live-broadcast channel.
   * - We do not support using string user accounts in this function.
   * - After a successful method call, if you want to call this method again,
   * ensure that you call the {@link stopChannelMediaRelay} method to quit
   * the current relay.
   *
   * @param config The configuration of the media stream relay:
   * {@link ChannelMediaRelayConfiguration}.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  startChannelMediaRelay(config: ChannelMediaRelayConfiguration): number {
    return this.rtcEngine.startChannelMediaRelay(config);
  }
  /** @zh-cn
   * 更新媒体流转发的频道。
   *
   * 成功开始跨频道转发媒体流后，如果你希望将流转发到多个目标频道，或退出当前的转发频道，可以
   * 调用该方法。
   *
   * 成功调用该方法后，SDK 会触发 `channelMediaRelayState` 回调，向你报告
   * {@link ChannelMediaRelayEvent} 中的 事件码 `7`。
   *
   * @note 请在 {@link startChannelMediaRelay} 方法后调用该方法，更新媒体流转发的频道。
   * @param config 跨频道媒体流转发参数配置
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Updates the channels for media stream relay.
   *
   * After the channel media relay starts, if you want to relay the media
   * stream to more channels, or leave the current relay channel, you can call
   * the {@link updateChannelMediaRelay} method.
   *
   * After a successful method call, the SDK triggers the
   * channelMediaRelayState callback with the state code `7` in
   * {@link ChannelMediaRelayEvent}.
   *
   * **Note**:
   *
   * Call this method after the {@link startChannelMediaRelay} method to
   * update the destination channel.
   *
   * @param config The media stream relay configuration:
   * {@link ChannelMediaRelayConfiguration}.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  updateChannelMediaRelay(config: ChannelMediaRelayConfiguration): number {
    return this.rtcEngine.updateChannelMediaRelay(config);
  }
  /** @zh-cn
   * 停止跨频道媒体流转发。
   *
   * 一旦停止，主播会退出所有目标频道。
   *
   * 成功调用该方法后，SDK 会触发 `channelMediaRelayState` 回调。
   * 如果报告 {@link ChannelMediaRelayState} 中的状态码 `0` 和 {@link ChannelMediaRelayError}
   * 中的错误码 `0`，则表示已停止转发媒体流。
   *
   * @note
   * 如果该方法调用不成功，SDK 会触发 `channelMediaRelayState` 回调，并报告
   * {@link ChannelMediaRelayError} 中的错误码  `2` 或 `8`。你可以调用
   * {@link leaveChannel} 方法离开频道，跨频道媒体流转发会自动停止。
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Stops the media stream relay.
   *
   * Once the relay stops, the host quits all the destination channels.
   *
   * After a successful method call, the SDK triggers the
   * channelMediaRelayState callback. If the callback reports the state
   * code `0` and the error code `1`, the host
   * successfully stops the relay.
   *
   * **Note**:
   * If the method call fails, the SDK triggers the
   * channelMediaRelayState callback with the error code `2` and `8` in
   * {@link ChannelMediaRelayError}. You can leave the channel by calling
   * the {@link leaveChannel} method, and
   * the media stream relay automatically stops.
   *
   * @return
   * - 0: Success
   * - < 0: Failure
   */
  stopChannelMediaRelay(): number {
    return this.rtcEngine.stopChannelMediaRelay();
  }

  // ===========================================================================
  // MANAGE AUDIO EFFECT
  // ===========================================================================
  /** @zh-cn
   * 获取播放音效文件音量。
   *
   *
   * @returns {number}
   * - &ge; 0：方法调用成功则返回音量值，范围为 [0.0, 100.0]
   * - < 0：方法调用失败
   */
  /**
   * Retrieves the volume of the audio effects.
   *
   * The value ranges between 0.0 and 100.0.
   * @return
   * - ≥ 0: Volume of the audio effects, if this method call succeeds.
   * - < 0: Failure.
   */
  getEffectsVolume(): number {
    return this.rtcEngine.getEffectsVolume();
  }
  /** @zh-cn
   * 设置播放音效文件音量。
   * @param {number} volume 音效文件的音量。取值范围为 [0.0, 100.0]，100.0 为默认值，表示原始音量。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Sets the volume of the audio effects.
   * @param {number} volume Sets the volume of the audio effects. The value
   * ranges between 0 and 100 (default).
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setEffectsVolume(volume: number): number {
    return this.rtcEngine.setEffectsVolume(volume);
  }
  /** @zh-cn
   * 设置单个音效文件的音量。
   * @param {number} soundId 指定音效的 ID。每个音效均有唯一的 ID
   * @param {number} volume 音效文件的音量。取值范围为 [0.0, 100.0]。100.0 为默认值
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Sets the volume of a specified audio effect.
   * @param {number} soundId ID of the audio effect. Each audio effect has a
   * unique ID.
   * @param {number} volume Sets the volume of the specified audio effect.
   * The value ranges between 0.0 and 100.0 (default).
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setVolumeOfEffect(soundId: number, volume: number): number {
    return this.rtcEngine.setVolumeOfEffect(soundId, volume);
  }
  /** @zh-cn
   * 播放指定音效文件。
   *
   * 该方法播放指定的本地或在线音效文件。你可以在该方法中设置音效文件的播放次数、音调、音效的空间位置和增益，以及远端用户是否能听到该音效。
   *
   * 你可以多次调用该方法，通过传入不同的音效文件的 soundID 和 filePath，同时播放多个音效文件，实现音效叠加。为获得最佳用户体验，我们建议同时播放的音效文件不要超过 3 个。
   *
   * 调用该方法播放音效结束后，SDK 会触发 `audioEffectFinished` 回调。
   *
   * @param {number} soundId 指定音效的 ID。每个音效均有唯一的 ID
   * @param {string} filePath 指定音效文件的绝对路径或 URL 地址（包含文件后缀名）。支持的音频格式包括：mp3、mp4、m4a、aac、3gp、mkv 及 wav
   * @param {number} loopcount 设置音效循环播放的次数：
   * - 0：播放音效一次
   * - 1：播放音效两次
   * - -1：无限循环播放音效，直至调用 {@link stopEffect} 或 {@link stopAllEffects} 后停止
   * @param {number} pitch 设置音效的音调，取值范围为 [0.5, 2]。默认值为 1.0，表示不需要修改音调。取值越小，则音调越低
   * @param {number} pan 设置是否改变音效的空间位置。取值范围为 [-1.0, 1.0]：
   * - 0.0：音效出现在正前方
   * - 1.0：音效出现在右边
   * - -1.0：音效出现在左边
   * @param {number} gain 设置是否改变单个音效的音量。取值范围为 [0.0, 100.0]。默认值为 100.0。取值越小，则音效的音量越低
   * @param {boolean} publish 设置是否将音效传到远端：
   * - true：音效在本地播放的同时，会发布到 Agora 云上，因此远端用户也能听到该音效
   * - false：音效不会发布到 Agora 云上，因此只能在本地听到该音效
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Plays a specified local or online audio effect file.
   *
   * This method allows you to set the loop count, pitch, pan, and gain of the
   * audio effect file, as well as whether the remote user can hear the audio
   * effect.
   *
   * To play multiple audio effect files simultaneously, call this method
   * multiple times with different soundIds and filePaths.
   * We recommend playing no more than three audio effect files at the same
   * time.
   *
   * When the audio effect file playback finishes, the SDK returns the
   * audioEffectFinished callback.
   * @param {number} soundId ID of the specified audio effect. Each audio
   * effect has a unique ID.
   * @param {string} filePath TSpecifies the absolute path (including the
   * suffixes of the filename) to the local audio effect file or the URL of
   * the online audio effect file. Supported audio formats: mp3, mp4, m4a,
   * aac, 3gp, mkv and wav.
   * @param {number} loopcount Sets the number of times the audio effect
   * loops:
   * - 0: Play the audio effect once.
   * - 1: Play the audio effect twice.
   * - -1: Play the audio effect in an indefinite loop until the
   * {@link stopEffect} or {@link stopEffect} method is called.
   * @param {number} pitch Sets the pitch of the audio effect. The value ranges
   * between 0.5 and 2.
   * The default value is 1 (no change to the pitch). The lower the value, the
   * lower the pitch.
   * @param {number} pan Sets the spatial position of the audio effect. The
   * value ranges between -1.0 and 1.0:
   * - 0.0: The audio effect displays ahead.
   * - 1.0: The audio effect displays to the right.
   * - -1.0: The audio effect displays to the left.
   * @param {number} gain Sets the volume of the audio effect. The value ranges
   * between 0.0 and 100.0 (default).
   * The lower the value, the lower the volume of the audio effect.
   * @param {boolean} publish Sets whether or not to publish the specified
   * audio effect to the remote stream:
   * - true: The locally played audio effect is published to the Agora Cloud
   * and the remote users can hear it.
   * - false: The locally played audio effect is not published to the Agora
   * Cloud and the remote users cannot hear it.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  playEffect(
    soundId: number,
    filePath: string,
    loopcount: number,
    pitch: number,
    pan: number,
    gain: number,
    publish: number
  ): number {
    return this.rtcEngine.playEffect(
      soundId,
      filePath,
      loopcount,
      pitch,
      pan,
      gain,
      publish
    );
  }
  /** @zh-cn
   * 停止播放指定音效文件。
   * @param {number} soundId 指定音效的 ID。每个音效均有唯一的 ID
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Stops playing a specified audio effect.
   * @param {number} soundId ID of the audio effect to stop playing. Each
   * audio effect has a unique ID.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  stopEffect(soundId: number): number {
    return this.rtcEngine.stopEffect(soundId);
  }

  /** @zh-cn
   * 停止播放所有音效文件。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Stops playing all audio effects.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  stopAllEffects(): number {
    return this.rtcEngine.stopAllEffects();
  }
  /** @zh-cn
   * 预加载音效文件。
   *
   * 为保证通信畅通，请注意控制预加载音效文件的大小，并在 {@link joinChannel} 前就使用该方法完成音效预加载。
   * 音效文件支持以下音频格式：mp3，aac，m4a，3gp，wav。
   * @param {number} soundId 指定音效的 ID。每个音效均有唯一的 ID。
   * @param {string} filePath 音效文件的绝对路径
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Preloads a specified audio effect file into the memory.
   *
   * To ensure smooth communication, limit the size of the audio effect file.
   * We recommend using this method to preload the audio effect before calling
   * the {@link joinChannel} method.
   *
   * Supported audio formats: mp3, aac, m4a, 3gp, and wav.
   *
   * **Note**:
   * This method does not support online audio effect files.
   *
   * @param {number} soundId ID of the audio effect. Each audio effect has a
   * unique ID.
   * @param {string} filePath The absolute path of the audio effect file.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  preloadEffect(soundId: number, filePath: string): number {
    return this.rtcEngine.preloadEffect(soundId, filePath);
  }
  /** @zh-cn
   * 释放音效文件。
   * @param {number} soundId 指定音效的 ID。每个音效均有唯一的 ID
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Releases a specified preloaded audio effect from the memory.
   * @param {number} soundId ID of the audio effect. Each audio effect has a
   * unique ID.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  unloadEffect(soundId: number): number {
    return this.rtcEngine.unloadEffect(soundId);
  }
  /** @zh-cn
   * 暂停音效文件播放。
   * @param {number} soundId 指定音效的 ID。每个音效均有唯一的 ID
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Pauses a specified audio effect.
   * @param {number} soundId ID of the audio effect. Each audio effect has a
   * unique ID.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  pauseEffect(soundId: number): number {
    return this.rtcEngine.pauseEffect(soundId);
  }
  /** @zh-cn
   * 暂停所有音效文件播放。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Pauses all the audio effects.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  pauseAllEffects(): number {
    return this.rtcEngine.pauseAllEffects();
  }
  /** @zh-cn
   * 恢复播放指定音效文件。
   * @param {number} soundId 指定音效的 ID。每个音效均有唯一的 ID
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Resumes playing a specified audio effect.
   * @param {number} soundId sound id
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  resumeEffect(soundId: number): number {
    return this.rtcEngine.resumeEffect(soundId);
  }
  /** @zh-cn
   * 恢复播放所有音效文件。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Resumes playing all audio effects.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  resumeAllEffects(): number {
    return this.rtcEngine.resumeAllEffects();
  }
  /** @zh-cn
   * 开启/关闭远端用户的语音立体声。
   *
   * 如果想调用 {@link setRemoteVoicePosition} 实现听声辨位的功能，请确保在调用 {@link joinChannel} 方法前调用该方法。
   *
   * @param {boolean} enable 是否开启远端用户语音立体声：
   * - true：开启
   * - false：（默认）关闭
   *
   * @returns {number}
   * - 0：方法调用成功
   * - -1：方法调用失败
   *
   */
  /**
   * Enables/Disables stereo panning for remote users.
   *
   * Ensure that you call this method before {@link joinChannel} to enable
   * stereo panning
   * for remote users so that the local user can track the position of a
   * remote user
   * by calling {@link setRemoteVoicePosition}.
   * @param {boolean} enable Sets whether or not to enable stereo panning for
   * remote users:
   * - true: enables stereo panning.
   * - false: disables stereo panning.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  enableSoundPositionIndication(enable: boolean) {
    return this.rtcEngine.enableSoundPositionIndication(enable);
  }

  /** @zh-cn
   * 设置远端用户声音的空间位置和音量，方便本地用户听声辨位。
   *
   * 用户通过调用该接口，设置远端用户声音出现的位置，左右声道的声音差异会让用户产生声音的方位感，从而判断出远端用户的实时位置。
   * 在多人在线游戏场景，如吃鸡游戏中，该方法能有效增加游戏角色的方位感，模拟真实场景。
   *
   * @note
   * - 使用该方法需要在加入频道前调用 {@link enableSoundPositionIndication} 开启远端用户的语音立体声
   * - 为获得最佳听觉体验，我们建议用户佩戴耳机
   * @param {number} uid 远端用户的 ID
   * @param {number} pan 设置远端用户声音出现的位置，取值范围为 [-1.0, 1.0]：
   * - 0.0：（默认）声音出现在正前方
   * - -1.0：声音出现在左边
   * - 1.0：声音出现在右边
   * @param {number} gain 设置远端用户声音的音量，取值范围为 [0.0, 100.0]，默认值为 100.0，表示该用户的原始音量。取值越小，则音量越低
   * @returns {number}
   * - 0：方法调用成功
   * - -1：方法调用失败
   */
  /**
   * Sets the sound position and gain of a remote user.
   *
   * When the local user calls this method to set the sound position of a
   * remote user, the sound difference between the left and right channels
   * allows
   * the local user to track the real-time position of the remote user,
   * creating a real sense of space. This method applies to massively
   * multiplayer online games, such as Battle Royale games.
   *
   * **Note**:
   * - For this method to work, enable stereo panning for remote users by
   * calling the {@link enableSoundPositionIndication} method before joining
   * a channel.
   * - This method requires hardware support. For the best sound positioning,
   * we recommend using a stereo speaker.
   * @param {number} uid The ID of the remote user.
   * @param {number} pan The sound position of the remote user. The value
   * ranges from -1.0 to 1.0:
   * - 0.0: The remote sound comes from the front.
   * - -1.0: The remote sound comes from the left.
   * - 1.0: The remote sound comes from the right.
   * @param {number} gain Gain of the remote user. The value ranges from 0.0
   * to 100.0. The default value is 100.0 (the original gain of the
   * remote user).
   * The smaller the value, the less the gain.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setRemoteVoicePosition(uid: number, pan: number, gain: number): number {
    return this.rtcEngine.setRemoteVoicePosition(uid, pan, gain);
  }

  // ===========================================================================
  // EXTRA
  // ===========================================================================

  /** @zh-cn
   * 获取通话 ID。
   *
   * 客户端在每次 {@link joinChannel} 后会生成一个对应的 `CallId`，标识该客户端的此次通话。
   * 有些方法如 {@link rate}, {@link complain} 需要在通话结束后调用，向 SDK 提交反馈，这些方法必须指定 `CallId` 参数。
   * 使用这些反馈方法，需要在通话过程中调用 `getCallId` 方法获取 `CallId`，在通话结束后在反馈方法中作为参数传入。
   * @returns {string} 通话 ID
   */
  /**
   * Retrieves the current call ID.
   * When a user joins a channel on a client, a `callId` is generated to
   * identify the call from the client.
   * Feedback methods, such as {@link rate} and {@link complain}, must be
   * called after the call ends to submit feedback to the SDK.
   *
   * The {@link rate} and {@link complain} methods require the `callId`
   * parameter retrieved from the {@link getCallId} method during a call.
   * `callId` is passed as an argument into the {@link rate} and
   * {@link complain} methods after the call ends.
   *
   * @return The current call ID.
   */
  getCallId(): string {
    return this.rtcEngine.getCallId();
  }

  /** @zh-cn
   * 给通话评分。
   * @param {string} callId 通过 getCallId 函数获取的通话 ID
   * @param {number} rating 给通话的评分，最低 1 分，最高 5 分
   * @param {string} desc （非必选项）给通话的描述，可选，长度应小于 800 字节
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Allows a user to rate a call after the call ends.
   * @param {string} callId The ID of the call, retrieved from
   * the {@link getCallId} method.
   * @param {number} rating Rating of the call. The value is between 1
   * (lowest score) and 5 (highest score).
   * @param {string} desc (Optional) The description of the rating,
   * with a string length of less than 800 bytes.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  rate(callId: string, rating: number, desc: string): number {
    return this.rtcEngine.rate(callId, rating, desc);
  }

  /** @zh-cn
   * 投诉通话质量。
   * @param {string} callId 通话 {@link getCallId} 方法获取的通话 ID
   * @param {string} desc 给通话的描述。可选参数，长度应小于 800 字节
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Allows a user to complain about the call quality after a call ends.
   * @param {string} callId Call ID retrieved from the {@link getCallId} method.
   * @param {string} desc (Optional) The description of the
   * complaint, with a string length of less than 800 bytes.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  complain(callId: string, desc: string): number {
    return this.rtcEngine.complain(callId, desc);
  }
  // //TODO(input)
  // setRecordingAudioFrameParameters(sampleRate: number, channel: 1 | 2, mode: 0 | 1 | 2, samplesPerCall: number): number {
  //   return this.rtcEngine.setRecordingAudioFrameParameters(sampleRate, channel, mode, samplesPerCall);
  // }

  setRecordingAudioFrameParameters(sampleRate: number, channel: 1 | 2, mode: 0 | 1 | 2, samplesPerCall: number): number {
    return this.rtcEngine.setRecordingAudioFrameParameters(sampleRate, channel, mode, samplesPerCall);
  }

  // ===========================================================================
  // replacement for setParameters call
  // ===========================================================================
  /** @zh-cn
   * 该方法为私有接口。
   * @ignore
   */
  /**
   * Private Interfaces.
   * @ignore
   */
  setBool(key: string, value: boolean): number {
    return this.rtcEngine.setBool(key, value);
  }
  /** @zh-cn
   * 该方法为私有接口。
   * @ignore
   */
  /**
   * Private Interfaces.
   * @ignore
   */
  setInt(key: string, value: number): number {
    return this.rtcEngine.setInt(key, value);
  }
  /** @zh-cn
   * 该方法为私有接口。
   * @ignore
   */
  /**
   * Private Interfaces.
   * @ignore
   */
  setUInt(key: string, value: number): number {
    return this.rtcEngine.setUInt(key, value);
  }

  /** @zh-cn
   * 该方法为私有接口。
   * @ignore
   */
  /**
   * Private Interfaces.
   * @ignore
   */
  setNumber(key: string, value: number): number {
    return this.rtcEngine.setNumber(key, value);
  }

  /** @zh-cn
   * 该方法为私有接口。
   * @ignore
   */
  /**
   * Private Interfaces.
   * @ignore
   */
  setString(key: string, value: string): number {
    return this.rtcEngine.setString(key, value);
  }
  /** @zh-cn
   * 该方法为私有接口。
   * @ignore
   */
  /**
   * Private Interfaces.
   * @ignore
   */
  setObject(key: string, value: string): number {
    return this.rtcEngine.setObject(key, value);
  }
  /** @zh-cn
   * 该方法为私有接口。
   * @ignore
   */
  /**
   * Private Interfaces.
   * @ignore
   */
  getBool(key: string): boolean {
    return this.rtcEngine.getBool(key);
  }
  /** @zh-cn
   * 该方法为私有接口。
   * @ignore
   */
  /**
   * Private Interfaces.
   * @ignore
   */
  getInt(key: string): number {
    return this.rtcEngine.getInt(key);
  }
  /** @zh-cn
   * 该方法为私有接口。
   * @ignore
   */
  /**
   * Private Interfaces.
   * @ignore
   */
  getUInt(key: string): number {
    return this.rtcEngine.getUInt(key);
  }
  /** @zh-cn
   * 该方法为私有接口。
   * @ignore
   */
  /**
   * Private Interfaces.
   * @ignore
   */
  getNumber(key: string): number {
    return this.rtcEngine.getNumber(key);
  }
  /** @zh-cn
   * 该方法为私有接口。
   * @ignore
   */
  /**
   * Private Interfaces.
   * @ignore
   */
  getString(key: string): string {
    return this.rtcEngine.getString(key);
  }
  /** @zh-cn
   * @ignore
   * 该方法为私有接口。
   */
  /**
   * @ignore
   * Private Interfaces.
   */
  getObject(key: string): string {
    return this.rtcEngine.getObject(key);
  }
  /** @zh-cn
   * @ignore
   * 该方法为私有接口。
   */
  /**
   * @ignore
   * Private Interfaces.
   */
  getArray(key: string): string {
    return this.rtcEngine.getArray(key);
  }
  /** @zh-cn
   *
   * 通过 JSON 配置 SDK 提供技术预览或特别定制功能。
   *
   * JSON 选项默认不公开。声网工程师正在努力寻求以标准化方式公开 JSON 选项。
   *
   * @param param JSON 字符串形式的参数
   *
   * @return
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Provides technical preview functionalities or special customizations by
   * configuring the SDK with JSON options.
   *
   * The JSON options are not public by default. Agora is working on making
   * commonly used JSON options public in a standard way.
   *
   * @param param The parameter as a JSON string in the specified format.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setParameters(param: string): number {
    return this.rtcEngine.setParameters(param);
  }
  /** @zh-cn
   * @ignore
   * 该方法为私有接口。
   */
  /**
   * @ignore
   * Private Interfaces.
   */
  convertPath(path: string): string {
    return this.rtcEngine.convertPath(path);
  }
  /** @zh-cn
   * @ignore
   * 该方法为私有接口。
   */
  /**
   * @ignore
   * Private Interfaces.
   */
  setProfile(profile: string, merge: boolean): number {
    return this.rtcEngine.setProfile(profile, merge);
  }

  // ===========================================================================
  // plugin apis
  // ===========================================================================
  /** @zh-cn
   * @ignore
   * 私有接口。
   */
  /**
   * Private Interfaces.
   * @ignore
   */
  initializePluginManager(): number {
    return this.rtcEngine.initializePluginManager();
  }
  /** @zh-cn
   * @ignore
   * 私有接口。
   */
  /**
   * Private Interfaces.
   * @ignore
   */
  releasePluginManager(): number {
    return this.rtcEngine.releasePluginManager();
  }
  /** @zh-cn
   * @ignore
   * 私有接口。
   */
  /**
   * Private Interfaces.
   * @ignore
   */
  registerPlugin(info: PluginInfo): number {
    return this.rtcEngine.registerPlugin(info);
  }
  /** @zh-cn
   * @ignore
   * 私有接口。
   */
  /**
   * Private Interfaces.
   * @ignore
   */
  unregisterPlugin(pluginId: string): number {
    return this.rtcEngine.unregisterPlugin(pluginId);
  }
  /** @zh-cn
   * @ignore
   * 私有接口。
   */
  /**
   * Private Interfaces.
   * @ignore
   */
  getPlugins() {
    return this.rtcEngine.getPlugins().map(item => {
      return this.createPlugin(item.id)
    })
  }
  /** @zh-cn
   * @ignore
   * 私有接口。
   */
  /**
   * @ignore
   * @param pluginId
   */
  createPlugin(pluginId: string): Plugin {
    return {
      id: pluginId,
      enable:() => {
        return this.enablePlugin(pluginId, true)
      },
      disable:() => {
        return this.enablePlugin(pluginId, false)
      },
      setParameter: (param: string) => {
        return this.setPluginParameter(pluginId, param)
      },
      getParameter: (paramKey: string) => {
        return this.getPluginParameter(pluginId, paramKey)
      }
    }
  }
  /** @zh-cn
   * @ignore
   * 私有接口。
   */
  /**
   * @ignore
   * @param pluginId
   * @param enabled
   */
  enablePlugin(pluginId: string, enabled: boolean): number {
    return this.rtcEngine.enablePlugin(pluginId, enabled);
  }

  /** @zh-cn
   * @ignore
   * 私有接口。
   */
  /**
   * @ignore
   * @param pluginId
   * @param param
   */
  setPluginParameter(pluginId: string, param: string): number {
    return this.rtcEngine.setPluginParameter(pluginId, param);
  }
  /** @zh-cn
   * @ignore
   * 私有接口。
   */
  /**
   * @ignore
   * @param pluginId
   * @param paramKey
   */
  getPluginParameter(pluginId: string, paramKey: string): string {
    return this.rtcEngine.getPluginParameter(pluginId, paramKey);
  }
  /** @zh-cn
   * 取消注册媒体附属信息观测器。
   *
   * @return
   * - 0: 方法调用成功
   * - < 0: 方法调用失败
   */
  /** Unregisters a media metadata observer.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  unRegisterMediaMetadataObserver(): number {
    return this.rtcEngine.unRegisterMediaMetadataObserver();
  }
  /** @zh-cn
   * 注册媒体附属信息观测器。
   *
   * @return
   * - 0: 方法调用成功
   * - < 0: 方法调用失败
   */
  /** Registers a media metadata observer.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  registerMediaMetadataObserver(): number {
    const fire = (event: string, ...args: Array<any>) => {
      setImmediate(() => {
        this.emit(event, ...args);
      });
    };

    this.rtcEngine.addMetadataEventHandler((metadata: Metadata) => {
      fire('receiveMetadata', metadata);
    }, (metadata: Metadata) => {
      fire('sendMetadataSuccess', metadata);
    });
    return this.rtcEngine.registerMediaMetadataObserver();
  }
  /** @zh-cn
   * 发送媒体附属信息。
   *
   * 调用 {@link registerMediaMetadataObserver} 后，你可以调用本方法来发送媒体附属信息。
   *
   * 如果发送成功，发送方会收到 `sendMetadataSuccess` 回调，接收方会收到 `receiveMetadata`
   * 回调。
   *
   * @param metadata 媒体附属信息。
   *
   * @return
   * - 0: 方法调用成功
   * - < 0: 方法调用失败
   */
  /** Sends the media metadata.
   *
   * After calling the {@link registerMediaMetadataObserver} method, you can
   * call the `setMetadata` method to send the media metadata.
   *
   * If it is a successful sending, the sender receives the
   * `sendMetadataSuccess` callback, and the receiver receives the
   * `receiveMetadata` callback.
   *
   * @param metadata The media metadata.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  sendMetadata(metadata: Metadata): number {
    return this.rtcEngine.sendMetadata(metadata);
  }
  /** @zh-cn
   * 设置媒体附属信息的最大大小。
   *
   * 调用 {@link registerMediaMetadataObserver} 后，你可以调用本方法来设置媒体附属信息
   * 的最大大小。
   *
   * @param size 媒体附属信息的最大大小。
   *
   * @return
   * - 0: 方法调用成功
   * - < 0: 方法调用失败
   */
  /** Sets the maximum size of the media metadata.
   *
   * After calling the {@link registerMediaMetadataObserver} method, you can
   * call the `setMaxMetadataSize` method to set the maximum size.
   *
   * @param size The maximum size of your metadata.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setMaxMetadataSize(size: number): number {
    return this.rtcEngine.setMaxMetadataSize(size);
  }
  /** @zh-cn
   * 声网提供自定义数据上报和分析服务。
   *
   * @since v3.2.0
   *
   * 该服务当前处于免费内测期。内测期提供的能力为 6 秒内最多上报 10 条数据，每条自定义数据
   * 不能超过 256 字节，每个字符串不能超过 100 字节。如需试用该服务，请
   * 联系 sales@agora.io 开通并商定自定义数据格式。
   */
  /** Agora supports reporting and analyzing customized messages.
   *
   * @since v3.2.0
   *
   * This function is in the beta stage with a free trial. The ability
   * provided in its beta test version is reporting a maximum of 10 message
   * pieces within 6 seconds, with each message piece not exceeding 256 bytes
   * and each string not exceeding 100 bytes.
   *
   * To try out this function, contact support@agora.io and discuss the
   * format of customized messages with us.
   */
  sendCustomReportMessage(id: string, category: string, event: string, label: string, value: number): number {
    return this.rtcEngine.sendCustomReportMessage(id, category, event, label, value);
  }
  /** @zh-cn
   * 开启或关闭内置加密。
   *
   * @since v3.2.0
   *
   * 在安全要求较高的场景下，Agora 建议你在加入频道前，调用 `enableEncryption` 方法开启内置加密。
   *
   * 同一频道内所有用户必须使用相同的加密模式和密钥。一旦所有用户都离开频道，该频道的加密密钥会自动清除。
   *
   * **Note**:
   * - 如果开启了内置加密，则不能使用 RTMP/RTMPS 推流功能。
   * - SDK 返回错误码 `-4`，当设置的加密模式不正确或加载外部加密库失败。你需检查枚举值是否正确或
   * 重新加载外部加密库。
   *
   * @param enabled 是否开启内置加密：
   * - true: 开启
   * - false: 关闭
   * @param config 配置内置加密模式和密钥。
   *
   * @return
   * - 0: 方法调用成功
   * - < 0: 方法调用失败
   */
  /** Enables/Disables the built-in encryption.
   *
   * @since v3.2.0
   *
   * In scenarios requiring high security, Agora recommends calling this
   * method to enable the built-in encryption before joining a channel.
   *
   * All users in the same channel must use the same encryption mode and
   * encryption key. Once all users leave the channel, the encryption key of
   * this channel is automatically cleared.
   *
   * @note If you enable the built-in encryption, you cannot use the RTMP or
   * RTMPS streaming function.
   *
   * @param enabled Whether to enable the built-in encryption:
   * - true: Enable the built-in encryption.
   * - false: Disable the built-in encryption.
   * @param config Configurations of built-in encryption schemas. See
   * {@link EncryptionConfig}.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  enableEncryption(enabled: boolean, config: EncryptionConfig): number {
    return this.rtcEngine.enableEncryption(enabled, config);
  }
  /** @zh-cn
   * 设置 SDK 预设的人声音效。
   *
   * @since v3.2.0
   *
   * 调用该方法可以为本地发流用户设置 SDK 预设的人声音效，且不会改变原声的性别特征。设置音效后，频道内所有用户都能听到该效果。
   * 根据不同的场景，你可以为用户设置不同的音效。
   *
   * 为获取更好的人声效果，Agora 推荐你在调用该方法前将 {@link setAudioProfile} 的 `scenario` 设为 `3`。
   *
   * **Note**:
   * - 该方法在加入频道前后都能调用。
   * - 请勿将 {@link setAudioProfile} 的 `profile` 参数设置为 `1` 或 `6`，否则该方法会调用失败。
   * - 该方法对人声的处理效果最佳，Agora 不推荐调用该方法处理含音乐的音频数据。
   * - 如果调用该方法并设置除 `ROOM_ACOUSTICS_3D_VOICE` 或 `PITCH_CORRECTION` 外的枚举，请勿再
   * 调用 {@link setAudioEffectParameters}，否则该方法设置的效果会被覆盖。
   * - 调用该方法后，Agora 不推荐调用以下方法，否则该方法设置的效果会被覆盖：
   *  - {@link setVoiceBeautifierPreset}
   *  - {@link setLocalVoiceReverbPreset}
   *  - {@link setLocalVoiceChanger}
   *  - {@link setLocalVoicePitch}
   *  - {@link setLocalVoiceEqualization}
   *  - {@link setLocalVoiceReverb}
   *
   * @param preset 预设的音效选项。
   *
   * @returns
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /** Sets an SDK preset audio effect.
   *
   * @since v3.2.0
   *
   * Call this method to set an SDK preset audio effect for the local user
   * who sends an audio stream. This audio effect
   * does not change the gender characteristics of the original voice.
   * After setting an audio effect, all users in the
   * channel can hear the effect.
   *
   * You can set different audio effects for different scenarios.
   *
   * To achieve better audio effect quality, Agora recommends calling
   * {@link setAudioProfile}
   * and setting the `scenario` parameter to `3` before calling this method.
   *
   * **Note**:
   * - You can call this method either before or after joining a channel.
   * - Do not set the profile `parameter` of `setAudioProfile` to `1` or `6`;
   * otherwise, this method call fails.
   * - This method works best with the human voice. Agora does not recommend
   * using this method for audio containing music.
   * - If you call this method and set the `preset` parameter to enumerators
   * except `ROOM_ACOUSTICS_3D_VOICE` or `PITCH_CORRECTION`,
   * do not call {@link setAudioEffectParameters}; otherwise,
   * {@link setAudioEffectParameters}
   * overrides this method.
   * - After calling this method, Agora recommends not calling the following
   * methods, because they can override `setAudioEffectPreset`:
   *  - {@link setVoiceBeautifierPreset}
   *  - {@link setLocalVoiceReverbPreset}
   *  - {@link setLocalVoiceChanger}
   *  - {@link setLocalVoicePitch}
   *  - {@link setLocalVoiceEqualization}
   *  - {@link setLocalVoiceReverb}
   *  - {@link setVoiceBeautifierParameters}
   *  - {@link setVoiceConversionPreset}
   *
   * @param preset The options for SDK preset audio effects.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setAudioEffectPreset(preset: AUDIO_EFFECT_PRESET): number {
    return this.rtcEngine.setAudioEffectPreset(preset);
  }
  /** @zh-cn
   * 设置 SDK 预设的美声效果。
   *
   * @since v3.2.0
   *
   * 调用该方法可以为本地发流用户设置 SDK 预设的人声美化效果。设置美声效果后，频道内所有用户都能听到该效果。
   * 根据不同的场景，你可以为用户设置不同的美声效果.
   *
   * 为获取更好的人声效果，Agora 推荐你在调用该方法前将 `setAudioProfile` 的 `scenario` 设为 `3`，并将 `profile` 设为 `4` 或 `5`。
   *
   * @note
   * - 该方法在加入频道前后都能调用。
   * - 请勿将 {@link setAudioProfile} 的 `profile` 参数设置为 `1` 或 `6`，否则该方法会调用失败。
   * - 该方法对人声的处理效果最佳，Agora 不推荐调用该方法处理含音乐的音频数据。
   * - 调用该方法后，Agora 不推荐调用以下方法，否则该方法设置的效果会被覆盖：
   *  - {@link setAudioEffectPreset}
   *  - {@link setAudioEffectParameters}
   *  - {@link setLocalVoiceReverbPreset}
   *  - {@link setLocalVoiceChanger}
   *  - {@link setLocalVoicePitch}
   *  - {@link setLocalVoiceEqualization}
   *  - {@link setLocalVoiceReverb}
   *
   * @param preset 预设的美声效果选项。
   *
   * @return
   * - 0: 方法调用成功
   * - < 0: 方法调用失败
   */

  /** Sets an SDK preset voice beautifier effect.
   *
   * @since v3.2.0
   *
   * Call this method to set an SDK preset voice beautifier effect for the
   * local user who sends an audio stream. After
   * setting a voice beautifier effect, all users in the channel can hear
   * the effect.
   *
   * You can set different voice beautifier effects for different scenarios.
   *
   * To achieve better audio effect quality, Agora recommends calling
   * {@link setAudioProfile} and
   * setting the `scenario` parameter to `3` and the `profile` parameter to
   * `4` or `5` before calling this method.
   *
   * @note
   * - You can call this method either before or after joining a channel.
   * - Do not set the `profile` parameter of {@link setAudioProfile} to
   * `1`
   * or `6`; otherwise, this method call fails.
   * - This method works best with the human voice. Agora does not recommend
   * using this method for audio containing music.
   * - After calling this method, Agora recommends not calling the following
   * methods, because they can override {@link setVoiceBeautifierPreset}:
   *  - {@link setAudioEffectPreset}
   *  - {@link setAudioEffectParameters}
   *  - {@link setLocalVoiceReverbPreset}
   *  - {@link setLocalVoiceChanger}
   *  - {@link setLocalVoicePitch}
   *  - {@link setLocalVoiceEqualization}
   *  - {@link setLocalVoiceReverb}
   *  - {@link setVoiceBeautifierParameters}
   *  - {@link setVoiceConversionPreset}
   *
   * @param preset The options for SDK preset voice beautifier effects.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setVoiceBeautifierPreset(preset: VOICE_BEAUTIFIER_PRESET): number {
    return this.rtcEngine.setVoiceBeautifierPreset(preset);
  }
  /** @zh-cn
   * 设置 SDK 预设人声音效的参数。
   *
   * @since v3.2.0
   *
   * 调用该方法可以对本地发流用户进行如下设置：
   * - 3D 人声音效：设置 3D 人声音效的环绕周期。
   * - 电音音效：设置电音音效的基础调式和主音音高。为方便用户自行调节电音音效，Agora 推荐你将基础调式和主音音高配置选项与应用的 UI 元素绑定。
   *
   * 设置后，频道内所有用户都能听到该效果。
   *
   * 该方法可以单独使用，也可以搭配 {@link setAudioEffectPreset} 使用。搭配使用时，
   * 需要先调用 {@link setAudioEffectPreset} 并使用 `ROOM_ACOUSTICS_3D_VOICE` 或 `PITCH_CORRECTION` 枚举，再调用该方法使用相同的枚举。
   * 否则，该方法设置的效果会覆盖 `setAudioEffectPreset` 设置的效果。
   *
   * @note
   * - 该方法在加入频道前后都能调用。
   * - 为获取更好的人声效果，Agora 推荐你在调用该方法前将 {@link setAudioProfile} 的 `scenario` 设为 `3`。
   * - 请勿将 {@link setAudioProfile} 的 `profile` 参数设置为 `1` 或 `6`，否则该方法会调用失败。
   * - 该方法对人声的处理效果最佳，Agora 不推荐调用该方法处理含音乐的音频数据。
   * - 调用该方法后，Agora 不推荐调用以下方法，否则该方法设置的效果会被覆盖：
   *   - {@link setAudioEffectPreset}
   *   - {@link setVoiceBeautifierPreset}
   *   - {@link setLocalVoiceReverbPreset}
   *   - {@link setLocalVoiceChanger}
   *   - {@link setLocalVoicePitch}
   *   - {@link setLocalVoiceEqualization}
   *   - {@link setLocalVoiceReverb}
   *
   * @param preset SDK 预设的音效：
   * - 3D 人声音效: `ROOM_ACOUSTICS_3D_VOICE`.
   *  - 你需要在使用该枚举前将 {@link setAudioProfile} 的 `profile` 参数设置 为 `3` 或 `5`，否则该枚举设置无效。
   *  - 启用 3D 人声后，用户需要使用支持双声道的音频播放设备才能听到预期效果。
   * - 电音音效：PITCH_CORRECTION。为获取更好的人声效果，
   * Agora 建议你在使用该枚举前将 {@link setAudioProfile} 的 `profile` 参数设置为 `4` 或 `5`。
   *
   * @param param1
   * - 如果 `preset` 设为 `ROOM_ACOUSTICS_3D_VOICE`，则 `param1` 表示 3D 人声音效的环绕周期。
   * 取值范围为 [1,60]，单位为秒。默认值为 10，表示人声会 10 秒环绕 360 度。
   * - 如果 `preset` 设为 `PITCH_CORRECTION`，则 `param1` 表示电音音效的基础调式。可设为如下值：
   *  - `1`:（默认）自然大调。
   *  - `2`: 自然小调。
   *  - `3`: 和风小调。
   *
   * @param param2
   * - 如果 `preset` 设为 `ROOM_ACOUSTICS_3D_VOICE`，你需要将 `param2` 设置为 0。
   * - 如果 `preset` 设为 `PITCH_CORRECTION`，则 `param2` 表示电音音效的主音音高。可设为如下值：
   *  - `1`: A
   *  - `2`: A#
   *  - `3`: B
   *  - `4`:（默认）C
   *  - `5`: C#
   *  - `6`: D
   *  - `7`: D#
   *  - `8`: E
   *  - `9`: F
   *  - `10`: F#
   *  - `11`: G
   *  - `12`: G#
   *
   * @return
   * - 0: 方法调用成功
   * - < 0: 方法调用失败
   */

  /** Sets parameters for SDK preset audio effects.
   *
   * @since v3.2.0
   *
   * Call this method to set the following parameters for the local user who
   * send an audio stream:
   * - 3D voice effect: Sets the cycle period of the 3D voice effect.
   * - Pitch correction effect: Sets the basic mode and tonic pitch of the
   * pitch correction effect. Different songs
   * have different modes and tonic pitches. Agora recommends bounding this
   * method with interface elements to enable
   * users to adjust the pitch correction interactively.
   *
   * After setting parameters, all users in the channel can hear the relevant
   * effect.
   *
   * You can call this method directly or after {@link setAudioEffectPreset}.
   * If you
   * call this method after {@link setAudioEffectPreset}, ensure that you set
   * the preset
   * parameter of {@link setAudioEffectPreset} to `ROOM_ACOUSTICS_3D_VOICE` or
   * `PITCH_CORRECTION` and then call this method
   * to set the same enumerator; otherwise, this method overrides
   * {@link setAudioEffectPreset}.
   *
   * @note
   * - You can call this method either before or after joining a channel.
   * - To achieve better audio effect quality, Agora recommends
   * calling {@link setAudioProfile}
   * and setting the `scenario` parameter to `3` before calling this method.
   * - Do not set the `profile` parameter of {@link setAudioProfile} to
   * `1` or
   * `6`; otherwise, this method call fails.
   * - This method works best with the human voice. Agora does not recommend
   * using this method for audio containing music.
   * - After calling this method, Agora recommends not calling the following
   * methods, because they can override `setAudioEffectParameters`:
   *  - {@link setAudioEffectPreset}
   *  - {@link setVoiceBeautifierPreset}
   *  - {@link setLocalVoiceReverbPreset}
   *  - {@link setLocalVoiceChanger}
   *  - {@link setLocalVoicePitch}
   *  - {@link setLocalVoiceEqualization}
   *  - {@link setLocalVoiceReverb}
   *  - {@link setVoiceBeautifierParameters}
   *  - {@link setVoiceConversionPreset}
   *
   * @param preset The options for SDK preset audio effects:
   * - 3D voice effect: `ROOM_ACOUSTICS_3D_VOICE`.
   *  - Call {@link setAudioProfile} and set the `profile` parameter to
   * `3`
   * or `5` before setting this enumerator; otherwise, the enumerator setting
   * does not take effect.
   *  - If the 3D voice effect is enabled, users need to use stereo audio
   * playback devices to hear the anticipated voice effect.
   * - Pitch correction effect: `PITCH_CORRECTION`. To achieve better audio
   *  effect quality, Agora recommends calling
   * {@link setAudioProfile} and setting the `profile` parameter to
   * `4` or
   * `5` before setting this enumerator.
   * @param param1
   * - If you set `preset` to `ROOM_ACOUSTICS_3D_VOICE`, the `param1` sets
   * the cycle period of the 3D voice effect.
   * The value range is [1,60] and the unit is a second. The default value is
   * 10 seconds, indicating that the voice moves
   * around you every 10 seconds.
   * - If you set `preset` to `PITCH_CORRECTION`, `param1` sets the basic
   * mode of the pitch correction effect:
   *  - `1`: (Default) Natural major scale.
   *  - `2`: Natural minor scale.
   *  - `3`: Japanese pentatonic scale.
   * @param param2
   * - If you set `preset` to `ROOM_ACOUSTICS_3D_VOICE`, you need to set
   * `param2` to `0`.
   * - If you set `preset` to `PITCH_CORRECTION`, `param2` sets the
   * tonic pitch of the pitch correction effect:
   *  - `1`: A
   *  - `2`: A#
   *  - `3`: B
   *  - `4`: (Default) C
   *  - `5`: C#
   *  - `6`: D
   *  - `7`: D#
   *  - `8`: E
   *  - `9`: F
   *  - `10`: F#
   *  - `11`: G
   *  - `12`: G#
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setAudioEffectParameters(preset: AUDIO_EFFECT_PRESET, param1: number, param2: number): number {
    return this.rtcEngine.setAudioEffectParameters(preset, param1, param2);
  }

  // 3.3.0 apis
  /** Sets the Agora cloud proxy service.
   *
   * @since v3.3.1
   *
   * When the user's firewall restricts the IP address and port, refer to
   * *Use Cloud Proxy* to add the specific
   * IP addresses and ports to the firewall whitelist; then, call this method
   * to enable the cloud proxy and set
   * the `type` parameter as `1`, which is the cloud proxy for
   * the UDP protocol.
   *
   * After a successfully cloud proxy connection, the SDK triggers the
   * `connectionStateChanged(2, 11)` callback.
   *
   * To disable the cloud proxy that has been set, call `setCloudProxy(0)`.
   * To change the cloud proxy type that has been set,
   * call `setCloudProxy(0)` first, and then call `setCloudProxy`, and pass
   * the value that you expect in `type`.
   *
   * @note
   * - Agora recommends that you call this method before joining the channel
   * or after leaving the channel.
   * - When you use the cloud proxy for the UDP protocol, the services for
   * pushing streams to CDN and co-hosting across channels are not available.
   *
   * @param type The cloud proxy type, see {@link CLOUD_PROXY_TYPE}. This
   * parameter is required, and the SDK reports an error if you do not pass
   * in a value.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   *  - `-2`: The parameter is invalid.
   *  - `-7`: The SDK is not initialized.
   */
  setCloudProxy(type:CLOUD_PROXY_TYPE): number {
    return this.rtcEngine.setCloudProxy(type);
  }
  /** Enables or disables deep-learning noise reduction.
   *
   * @since v3.3.1
   *
   * The SDK enables traditional noise reduction mode by default to reduce
   * most of the stationary background noise.
   * If you need to reduce most of the non-stationary background noise, Agora
   * recommends enabling deep-learning
   * noise reduction as follows:
   *
   * 1. Integrate the dynamical library under the `Release` folder to your
   * project:
   *  - macOS: `AgoraAIDenoiseExtension.framework`
   *  - Windows: `libagora_ai_denoise_extension.dll`
   * 2. Call `enableDeepLearningDenoise(true)`.
   *
   * Deep-learning noise reduction requires high-performance devices. For
   * example, the following devices and later
   * models are known to support deep-learning noise reduction:
   * - iPhone 6S
   * - MacBook Pro 2015
   * - iPad Pro (2nd generation)
   * - iPad mini (5th generation)
   * - iPad Air (3rd generation)
   *
   * After successfully enabling deep-learning noise reduction, if the SDK
   * detects that the device performance
   * is not sufficient, it automatically disables deep-learning noise reduction
   * and enables traditional noise reduction.
   *
   * If you call `enableDeepLearningDenoise(false)` or the SDK automatically
   * disables deep-learning noise reduction
   * in the channel, when you need to re-enable deep-learning noise reduction,
   * you need to call {@link leaveChannel}
   * first, and then call `enableDeepLearningDenoise(true)`.
   *
   * @note
   * - This method dynamically loads the library, so Agora recommends calling
   * this method before joining a channel.
   * - This method works best with the human voice. Agora does not recommend
   * using this method for audio containing music.
   *
   * @param enable Sets whether to enable deep-learning noise reduction.
   * - true: (Default) Enables deep-learning noise reduction.
   * - false: Disables deep-learning noise reduction.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   *  - `-157: The dynamical library for enabling deep-learning noise
   * reduction is not integrated.
   */
  enableDeepLearningDenoise(enabled:boolean): number {
    return this.rtcEngine.enableDeepLearningDenoise(enabled);
  }
  /** Sets parameters for SDK preset voice beautifier effects.
   *
   * @since v3.3.1
   *
   * Call this method to set a gender characteristic and a reverberation
   * effect for the singing beautifier effect. This method sets parameters
   * for the local user who sends an audio stream.
   *
   * After you call this method successfully, all users in the channel can
   * hear the relevant effect.
   *
   * To achieve better audio effect quality, before you call this method,
   * Agora recommends calling {@link setAudioProfile}, and setting the
   * `scenario` parameter
   * as `3` and the `profile` parameter as `4` or `5`.
   *
   * @note
   * - You can call this method either before or after joining a channel.
   * - Do not set the `profile` parameter of {@link setAudioProfile} as
   * `1` or `6`; otherwise, this method call does not take effect.
   * - This method works best with the human voice. Agora does not recommend
   * using this method for audio containing music.
   * - After you call this method, Agora recommends not calling the following
   * methods, because they can override `setVoiceBeautifierParameters`:
   *    - {@link setAudioEffectPreset}
   *    - {@link setAudioEffectParameters}
   *    - {@link setVoiceBeautifierPreset}
   *    - {@link setLocalVoiceReverbPreset}
   *    - {@link setLocalVoiceChanger}
   *    - {@link setLocalVoicePitch}
   *    - {@link setLocalVoiceEqualization}
   *    - {@link setLocalVoiceReverb}
   *    - {@link setVoiceConversionPreset}
   *
   * @param preset The options for SDK preset voice beautifier effects:
   * - `SINGING_BEAUTIFIER`: Singing beautifier effect.
   * @param param1 The gender characteristics options for the singing voice:
   * - `1`: A male-sounding voice.
   * - `2`: A female-sounding voice.
   * @param param2 The reverberation effects options:
   * - `1`: The reverberation effect sounds like singing in a small room.
   * - `2`: The reverberation effect sounds like singing in a large room.
   * - `3`: The reverberation effect sounds like singing in a hall.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setVoiceBeautifierParameters(preset:VOICE_BEAUTIFIER_PRESET, param1:number, param2:number): number {
    return this.rtcEngine.setVoiceBeautifierParameters(preset, param1, param2);
  }
  /**
   * @ignore
   */
  uploadLogFile(): string {
    return this.rtcEngine.uploadLogFile();
  }
  //3.3.1
  /** Sets an SDK preset voice conversion effect.
   *
   * @since v3.3.1
   *
   * Call this method to set an SDK preset voice conversion effect for the
   * local user who sends an audio stream. After setting a voice conversion
   * effect, all users in the channel can hear the effect.
   *
   * You can set different voice conversion effects for different scenarios.
   * See *Set the Voice Effect*.
   *
   * To achieve better voice effect quality, Agora recommends calling
   * {@link setAudioProfile} and setting the
   * `profile` parameter to `4` or
   * `5` and the `scenario`
   * parameter to `3` before calling this
   * method.
   *
   * **Note**:
   * - You can call this method either before or after joining a channel.
   * - Do not set the `profile` parameter of `setAudioProfile` to
   * `1` or
   * `6`; otherwise, this method call does not take effect.
   * - This method works best with the human voice. Agora does not recommend
   * using this method for audio containing music.
   * - After calling this method, Agora recommends not calling the following
   * methods, because they can override `setVoiceConversionPreset`:
   *  - {@link setAudioEffectPreset}
   *  - {@link setAudioEffectParameters}
   *  - {@link setVoiceBeautifierPreset}
   *  - {@link setVoiceBeautifierParameters}
   *  - {@link setLocalVoiceReverbPreset}
   *  - {@link setLocalVoiceChanger}
   *  - {@link setLocalVoicePitch}
   *  - {@link setLocalVoiceEqualization}
   *  - {@link setLocalVoiceReverb}
   *
   * @param preset The options for SDK preset voice conversion effects.
   * See {@link VOICE_CONVERSION_PRESET}.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setVoiceConversionPreset(preset:VOICE_CONVERSION_PRESET): number {
    return this.rtcEngine.setVoiceConversionPreset(preset);
  }
}
/** @zh-cn
 *  AgoraRtcEngine
 */
/** The AgoraRtcEngine interface. */
declare interface AgoraRtcEngine {
  /** @zh-cn
   * API 方法已执行回调。
   *
   * @param cb.api SDK 执行的 API
   *
   * @param cb.err 当该方法调用失败时 SDK 返回的错误码
   *
   */
  /**
   * Occurs when an API method is executed.
   *
   * `api`: The method executed by the SDK.
   *
   * `err`: Error code that the SDK returns when the method call fails.
   */
  on(evt: 'apiCallExecuted', cb: (api: string, err: number) => void): this;
  /** @zh-cn
   * 发生警告回调。
   *
   * @param cb.warn 警告码
   * @param cb.msg 详细的警告信息
   */
  /**
   * Reports a warning during SDK runtime.
   * @param cb.warn Warning code.
   * @param cb.msg The warning message.
   */
  on(evt: 'warning', cb: (warn: number, msg: string) => void): this;
  /** @zh-cn
   * 发生错误回调。
   *
   * @param cb.err 错误码
   *
   * @param cb.msg 详细的错误信息
   */
  /** Reports an error during SDK runtime.
   * @param cb.err Error code.
   * @param cb.msg The error message.
   */
  on(evt: 'error', cb: (err: number, msg: string) => void): this;
  /** @zh-cn
   * 成功加入频道。
   *
   * @param cb.channel 频道名
   *
   * @param cb.uid 用户 ID
   *
   * @param cb.elapsed 从调用 {@link joinChannel} 开始到发生此事件过去的时间（毫秒)
   */
  /** Occurs when a user joins a specified channel.
   * @param cb.channel The channel name.
   * @param cb.uid User ID of the user joining the channel.
   * @param cb.elapsed Time elapsed (ms) from the user calling the
   * {@link joinChannel}
   * method until the SDK triggers this callback.
   */
on(
  evt: 'joinedChannel',
  cb: (channel: string, uid: number, elapsed: number) => void
): this;
  /** @zh-cn
   * 重新加入频道回调。
   *
   * 有时候由于网络原因，客户端可能会和服务器失去连接，SDK 会进行自动重连，自动重连成功后触发此回调方法。
   *
   * @param cb.channel 频道名
   *
   * @param cb.uid 用户 ID
   *
   * @param cb.elapsed 从调用 {@link joinChannel} 开始到发生此事件过去的时间（毫秒)
   */
  /** Occurs when a user rejoins the channel after disconnection due to network
   * problems.
   * When a user loses connection with the server because of network problems,
   * the SDK automatically tries to reconnect and triggers this callback upon
   * reconnection.
   * @param cb.channel The channel name.
   * @param cb.uid User ID of the user joining the channel.
   * @param cb.elapsed Time elapsed (ms) from the user calling the
   * {@link joinChannel}
   * method until the SDK triggers this callback.
   */
  on(
    evt: 'rejoinedChannel',
    cb: (channel: string, uid: number, elapsed: number) => void
  ): this;
  // on(evt: 'audioQuality', cb: (
  //   uid: number, quality: AgoraNetworkQuality, delay: number, lost: number
  // ) => void): this;
  /** @zh-cn
   * @deprecated 本回调为废弃回调。Agora 推荐你使用 `groupAudioVolumeIndication` 回调。
   */
  /**
   * @deprecated Deprecated. Use the `groupAudioVolumeIndication` callback
   * instead.
   */
  on(
    evt: 'audioVolumeIndication',
    cb: (
      uid: number,
      volume: number,
      speakerNumber: number,
      totalVolume: number
    ) => void
  ): this;
  /** @zh-cn
   * 提示频道内谁在说话以及说话者音量的回调。
   *
   * 该回调提示频道内瞬时音量较高的几个用户的用户 ID 及他们的音量。默认禁用。可以通过 {@link enableAudioVolumeIndication} 方法开启；开启后，无论频道内是否有人说话，都会按方法中设置的时间间隔返回提示音量。
   *
   * @note
   * - 本地用户返回 `uid` 为 `0`，`speakerNumber` 始终为 `1`。
   * - 用户调用 {@link muteLocalAudioStream} 方法会对该回调产生影响：
   *  - 本地用户：随即不再返回该回调。
   *  - 远端用户：15 秒后，该回调的报告中不再包含该远端用户。
   *
   * @param cb.speakers 音量较高的说话者的信息，包含：
   *   - `uid`：用户 ID
   *   - `volume`：本地用户：该用户的说话音量；远端用户：说话者各自混音后的音量
   *   - `vad`：本地用户：报告本地用户人声状态；远端用户：0
   *
   * @param cb.speakerNumber 音量较高的用户人数：
   * - 本地用户：1
   * - 远端用户：3
   *
   * @param cb.totalVolume 混音后总音量（分贝）。取值范围 [0,255]：
   * - 本地用户：本地用户混音后的音量
   * - 远端用户：所有说话者混音后的总音量
   */
  /** Reports which users are speaking, the speakers' volume and whether the
   * local user is speaking.
   *
   * This callback reports the IDs and volumes of the loudest speakers
   * (at most 3 users) at the moment in the channel, and whether the local user
   * is speaking.
   *
   * By default, this callback is disabled. You can enable it by calling the
   * {@link enableAudioVolumeIndication} method.
   *
   * The SDK triggers two independent `groupudioVolumeIndication` callbacks at
   * one time, which separately report the volume information of the local user
   * and all the remote speakers. For more information, see the detailed
   * parameter descriptions.
   *
   * @note
   * - To enable the voice activity detection of the local user, ensure that
   * you set `report_vad(true)` in the `enableAudioVolumeIndication` method.
   * - Calling the {@link muteLocalAudioStream} method affects the SDK's
   * behavior:
   *  - If the local user calls `muteLocalAudioStream`, the SDK stops
   * triggering the local user's callback.
   *  - 20 seconds after a remote speaker calls `muteLocalAudioStream`, the
   * remote speakers' callback excludes this remote user's information; 20
   * seconds after all remote users call `muteLocalAudioStream`, the SDK stops
   * triggering the remote speakers' callback.
   *
   * @param cb.speakers The speakers' information:
   * - In the local client:
   *  - `uid`: 0.
   *  - `volume`: The volume of the local speaker.
   *  - `vad`: The voice activity status of the local user.
   * - In each remote client:
   *  - `uid`: The ID of the remote user.
   *  - `volume`: The sum of the voice volume and audio-mixing volume of
   * each remote speaker.
   *  - `vad`: 0.
   *
   * @param cb.speakerNumber Total number of speakers. The value range is
   * [0, 3].
   * - In the local client: 1.
   * - In each remote client: 3, the three loudest speakers.
   * @param cb.totalVolume Total volume after audio mixing. The value ranges
   * between 0 (lowest volume) and 255 (highest volume).
   * - In the local client: The sum of the voice volume and audio-mixing volume
   * of the local user.
   * - In each remote client: The sum of the voice volume and audio-mixing
   * volume of all the remote speakers.
   */
  on(
    evt: 'groupAudioVolumeIndication',
    cb: (
      speakers: {
        uid: number;
        volume: number;
        vad: number;
      }[],
      speakerNumber: number,
      totalVolume: number
    ) => void
  ): this;
  /** @zh-cn
   * 用户离开频道。
   *
   * 调用 {@link leaveChannel} 离开频道后，SDK 触发该回调。
   */
  /** Occurs when the user leaves the channel. When the app calls the
   * {@link leaveChannel} method, the SDK uses
   * this callback to notify the app when the user leaves the channel.
   */
on(evt: 'leaveChannel', cb: (stats: RtcStats) => void): this;
  /** @zh-cn
   *
   * 通话相关统计信息。
   *
   * @param cb.stats 通话信息详情
   */
  /** Reports the statistics of the AgoraRtcEngine once every two seconds.
   *
   * @param cb.stats AgoraRtcEngine's statistics, see {@link RtcStats}
   */
  on(evt: 'rtcStats', cb: (stats: RtcStats) => void): this;
  /** @zh-cn
   * 通话中本地视频流的统计信息回调。
   *
   * @note 如果你此前调用 {@link enableDualStreamMode} 方法，则本回调描述本地设备发送的视频大流的统计信息。
   *
   *
   * @param cb.stats 本地视频流统计信息
   */
  /**
   * Reports the statistics of the local video streams.
   *
   * **Note**:
   *
   * If you have called the {@link enableDualStream} method, the
   * localVideoStats callback reports the statistics of the high-video
   * stream (high bitrate, and high-resolution video stream).
   *
   * - stats: The statistics of the local video stream. See
   * {@link LocalVideoStats}.
   */
  on(evt: 'localVideoStats', cb: (stats: LocalVideoStats) => void): this;
  /** @zh-cn
   * 通话中本地音频流的统计信息回调。
   *
   *
   * @param cb.stats 本地音频流统计信息
   */
  /**
   * Reports the statistics of the local audio streams.
   *
   * The SDK triggers this callback once every two seconds.
   *
   * - stats: The statistics of the local audio stream. See
   * {@link LocalAudioStats}.
   */
  on(evt: 'localAudioStats', cb: (stats: LocalAudioStats) => void): this;
  /** @zh-cn
   * 通话中远端视频流的统计信息回调。
   *
   * @param cb.stats 远端视频流统计信息
   */
  /** Reports the statistics of the video stream from each remote user/host.
   *
   * @param cb.stats Statistics of the received remote video streams. See
   * {@link RemoteVideoState}.
   */
  on(evt: 'remoteVideoStats', cb: (stats: RemoteVideoStats) => void): this;
  /** @zh-cn
   * 通话中远端音频流的统计信息回调。
   *
   * @param cb.stats 远端音频流统计信息
   */
  /** Reports the statistics of the audio stream from each remote user/host.
   *
   * @param cb.stats Statistics of the received remote audio streams. See
   * {@link RemoteAudioStats}.
   */
  on(evt: 'remoteAudioStats', cb: (stats: RemoteAudioStats) => void): this;
  /** @zh-cn
   * @deprecated 该回调已废弃。请改用 remoteVideoStats 回调。
   *
   * 通话中远端视频流传输的统计信息回调。
   *
   * 该回调描述远端用户通话中端到端的网络统计信息，通过视频包计算，用客观的数据，如丢包、网络延迟等 ，展示当前网络状态。
   *
   * 通话中，当用户收到远端用户/主播发送的视频数据包后，会每 2 秒触发一次该回调。和 remoteVideoStats 回调相比，该回调以数据展示当前网络状态，因此更客观。
   *
   * @param cb.stats 远端视频流传输的统计信息
   */
  /**
   * @deprecated This callback is deprecated. Use remoteVideoStats instead.
   *
   * Reports the transport-layer statistics of each remote video stream.
   *
   * This callback reports the transport-layer statistics, such as the packet
   * loss rate and time delay, once every two seconds
   * after the local user receives the video packet from a remote user.
   * - stats: The transport-layer statistics. See
   * {@link RemoteVideoTransportStats}.
   */
  on(evt: 'remoteVideoTransportStats', cb: (stats: RemoteVideoTransportStats) => void): this;

  /** @zh-cn
   * @deprecated 该回调已废弃。请改用 remoteAudioStats 回调。
   *
   * 通话中远端音频流传输的统计信息回调。
   *
   * @param cb.stats 远端音频流传输的统计信息
   */
  /**
   * @deprecated This callback is deprecated. Use remoteAudioStats instead.
   *
   * Reports the transport-layer statistics of each remote audio stream.
   *
   * @param cb.stats The transport-layer statistics. See
   * {@link RemoteAudioTransportStats}.
   */
on(
  evt: 'remoteAudioTransportStats',
  cb: (stats: RemoteAudioTransportStats) => void
): this;
  /** @zh-cn
   *
   * 音频设备状态已改变回调。
   *
   * @param cb.deviceId 设备 ID
   *
   * @param cb.deviceType 设备类型，详见 {@link MediaDeviceType}
   *
   * @param cb.deviceState 设备状态
   *   - `1`：设备正在使用
   *   - `2`：设备被禁用
   *   - `4`：没有此设备
   *   - `8`：设备被拔出
   */
  /**
   * Occurs when the audio device state changes.
   * - deviceId: The device ID.
   * - deviceType: Device type. See {@link MediaDeviceType}.
   * - deviceState: Device state：
   *
   *  - 1: The device is active
   *  - 2: The device is disabled.
   *  - 4: The device is not present.
   *  - 8: The device is unplugged.
   */
  on(
    evt: 'audioDeviceStateChanged',
    cb: (deviceId: string, deviceType: number, deviceState: number) => void
  ): this;
  // on(evt: 'audioMixingFinished', cb: () => void): this;
  /** @zh-cn
   * 本地用户的音乐文件播放状态改变。
   *
   * @param cb.state 状态码
   *   - `710`：音乐文件正常播放
   *   - `711`：音乐文件暂停播放
   *   - `713`：音乐文件停止播放
   *   - `714`：音乐文件报错。SDK 会在 `err` 中返回具体的报错原因
   *
   * @param cb.err 错误码
   *   - `701`：音乐文件打开出错
   *   - `702`：音乐文件打开太频繁
   *   - `703`：音乐文件播放异常中断
   */
  /** Occurs when the state of the local user's audio mixing file changes.
   * - state: The state code.
   *  - 710: The audio mixing file is playing.
   *  - 711: The audio mixing file pauses playing.
   *  - 713: The audio mixing file stops playing.
   *  - 714: An exception occurs when playing the audio mixing file.
   *
   * - err: The error code.
   *  - 701: The SDK cannot open the audio mixing file.
   *  - 702: The SDK opens the audio mixing file too frequently.
   *  - 703: The audio mixing file playback is interrupted.
   *
   */
  on(evt: 'audioMixingStateChanged', cb: (state: number, err: number) => void): this;
  /** @zh-cn
   * 远端音乐文件播放已开始回调。
   *
   * 当远端有用户调用 {@link startAudioMixing} 播放本地音乐文件，SDK 会触发该回调。
   */
  /** Occurs when a remote user starts audio mixing.
   * When a remote user calls {@link startAudioMixing} to play the background
   * music, the SDK reports this callback.
   */
  on(evt: 'remoteAudioMixingBegin', cb: () => void): this;
  /** @zh-cn
   * 远端音乐文件播放已结束回调。
   */
  /** Occurs when a remote user finishes audio mixing. */
  on(evt: 'remoteAudioMixingEnd', cb: () => void): this;
  /** @zh-cn
   * 本地音效文件播放已结束回调。
   *
   * 当播放音效结束后，会触发该回调。
   *
   * @param cb.soundId 指定音效的 ID。每个音效均有唯一的 ID。
   */
  /** Occurs when the local audio effect playback finishes. */
  on(evt: 'audioEffectFinished', cb: (soundId: number) => void): this;
  /** @zh-cn
   * 该回调没有实现。
   *
   * 视频设备变化回调。
   *
   * 该回调提示系统视频设备状态发生改变，比如被拔出或移除。如果设备已使用外接摄像头采集，外接摄像头被拔开后，视频会中断。
   *
   * @param cb.deviceId 设备 ID
   *
   * @param cb.deviceType 设备类型，详见 {@link MediaDeviceType}
   *
   * @param cb.deviceState 设备状态
   *   - `1`：设备正在使用
   *   - `2`：设备被禁用
   *   - `4`：没有此设备
   *   - `8`：设备被拔出
   *
   */
  /**
   * This callback is not work.
   *
   * Occurs when the video device state changes.
   * - deviceId: The device ID.
   * - deviceType: Device type. See {@link MediaDeviceType}.
   * - deviceState: Device state：
   *
   *  - 1: The device is active.
   *  - 2: The device is disabled.
   *  - 4: The device is not present.
   *  - 8: The device is unplugged.
   */
  on(evt: 'videoDeviceStateChanged', cb: (
    deviceId: string,
    deviceType: number,
    deviceState: number,
  ) => void): this;
  /** @zh-cn
   * 通话中每个用户的网络上下行 last mile 质量报告回调。
   *
   * 该回调描述每个用户在通话中的 last mile 网络状态，其中 last mile 是指设备到 Agora 边缘服务器的网络状态。
   *
   * 该回调每 2 秒触发一次。如果远端有多个用户，该回调每 2 秒会被触发多次。
   *
   * @param cb.uid 用户 ID。表示该回调报告的是持有该 ID 的用户的网络质量。
   * 当 uid 为 0 时，返回的是本地用户的网络质量
   *
   * @param cb.txquality 该用户的上行网络质量，基于上行发送码率、上行丢包率、平均往返时延和网络
   * 抖动计算。
   *
   * @param cb.rxquality 该用户的下行网络质量，基于下行网络的丢包率、平均往返延时和网络抖动计算。
   *
   */
  /**
   * Reports the last mile network quality of each user in the channel
   * once every two seconds.
   *
   * Last mile refers to the connection between the local device and Agora's
   * edge server.
   *
   * @param cb.uid User ID. The network quality of the user with this uid is
   * reported.
   * If uid is 0, the local network quality is reported.
   * @param cb.txquality Uplink transmission quality rating of the user in
   * terms of
   * the transmission bitrate, packet loss rate, average RTT (Round-Trip Time),
   * and jitter of the uplink network. See {@link AgoraNetworkQuality}.
   * @param cb.rxquality Downlink network quality rating of the user in terms
   * of the
   * packet loss rate, average RTT, and jitter of the downlink network.
   * See {@link AgoraNetworkQuality}.
   */
on(
  evt: 'networkQuality',
  cb: (
    uid: number,
    txquality: AgoraNetworkQuality,
    rxquality: AgoraNetworkQuality
  ) => void
): this;
  /** @zh-cn
   * 通话前网络上下行 last mile 质量报告回调。
   *
   * 该回调描述本地用户在加入频道前的 last mile 网络探测的结果，其中 last mile 是指设备到 Agora 边缘服务器的网络状态。
   *
   * 在调用 {@link enableLastmileTest} 之后，该回调函数每 2 秒触发一次。如果远端有多个用户/主播，该回调每 2 秒会被触发多次。
   *
   * @param cb.quality 网络上下行质量，基于上下行网络的丢包率和抖动计算，探测结果主要反映上行网络的状态。
   */

  /** Reports the last mile network quality of the local user once every two
   * seconds before the user joins the channel.
   * - quality: The last mile network quality. See {@link AgoraNetworkQuality}.
   *
   * Last mile refers to the connection between the local device and Agora's
   * edge server. After the application calls the
   * {@link enableLastmileTest} method,
   * this callback reports once every two seconds the uplink and downlink last
   * mile network conditions of the local user before the user joins the
   * channel.
   */
  on(evt: 'lastMileQuality', cb: (quality: AgoraNetworkQuality) => void): this;
  /** @zh-cn
   * 通话前网络质量探测报告回调。
   *
   * 在调用 {@link startLastmileProbeTest} 之后，SDK 会在约 30 秒内返回该回调。
   *
   * @param cb.result 上下行 Last mile 质量探测结果。
   *
   */
  /** Reports the last-mile network probe result.
   * - result: The uplink and downlink last-mile network probe test result.
   * See {@link LastmileProbeResult}.
   *
   * The SDK triggers this callback within 30 seconds after the app calls
   * the {@link startLastmileProbeTest} method.
   */

  on(
    evt: 'lastmileProbeResult',
    cb: (result: LastmileProbeResult) => void
  ): this;
  /** @zh-cn
   * 已显示本地视频首帧回调。
   *
   * 本地视频首帧显示在本地视图上时，SDK 会触发此回调。
   *
   *
   * @param cb.width 本地渲染视频的宽 (px)
   *
   * @param cb.height 本地渲染视频的高 (px)
   *
   * @param cb.elapsed 从本地调用 {@link joinChannel} 到发生此事件过去的时间（毫秒)
   */
  /** Occurs when the first local video frame is displayed/rendered on the
   * local video view.
   *
   * - width: Width (px) of the first local video frame.
   * - height: Height (px) of the first local video frame.
   * - elapsed: Time elapsed (ms) from the local user calling the
   * {@link joinChannel} method until the SDK triggers this callback.
   */
  on(
    evt: 'firstLocalVideoFrame',
    cb: (width: number, height: number, elapsed: number) => void
  ): this;
  /** @zh-cn
   * @deprecated 这个回调已被废弃，请改用 remoteVideoStateChanged 回调。
   *
   * 已接收到远端视频并完成解码回调。
   *
   *
   * 引擎收到第一帧远端视频流并解码成功时，触发此调用。有两种情况：
   * - 远端用户首次上线后发送视频
   * - 远端用户视频离线再上线后发送视频。出现这种中断的可能原因包括：
   *   - 远端用户离开频道
   *   - 远端用户掉线
   *   - 远端用户调用 {@link muteLocalVideoStream} 方法停止发送本地视频流
   *   - 远端用户调用 {@link disableVideo} 方法关闭视频模块
   *
   * @param cb.uid 用户 ID，指定是哪个用户的视频流
   *
   * @param cb.elapsed 从本地调用 {@link joinChannel} 到发生此事件过去的时间（毫秒)
   *
   */
  /**
   * @deprecated This callback is deprecated. Use the remoteVideoStateChanged
   * callback instead.
   *
   * Occurs when the first remote video frame is received and decoded.
   * - uid: User ID of the remote user sending the video stream.
   * - elapsed: Time elapsed (ms) from the local user calling the
   * {@link joinChannel} method until the SDK triggers this callback.
   * This callback is triggered in either of the following scenarios:
   * - The remote user joins the channel and sends the video stream.
   * - The remote user stops sending the video stream and re-sends it after
   * 15 seconds. Reasons for such an interruption include:
   *  - The remote user leaves the channel.
   *  - The remote user drops offline.
   *  - The remote user calls the {@link muteLocalVideoStream} method to stop
   * sending the video stream.
   *  - The remote user calls the {@link disableVideo} method to disable video.
   */
  on(evt: 'addStream', cb: (
    uid: number,
    elapsed: number,
  ) => void): this;
  /** @zh-cn
   * 本地或远端视频大小和旋转信息发生改变回调。
   *
   * @param cb.uid 图像尺寸和旋转信息发生变化的用户的用户 ID（本地用户的 `uid` 为 `0`）
   *
   * @param cb.width 视频流的宽度（px）
   *
   * @param cb.height 视频流的高度（px）
   *
   * @param cb.rotation 旋转信息 [0, 360]
   */
  /** Occurs when the video size or rotation of a specified user changes.
   * @param cb.uid User ID of the remote user or local user (0) whose video
   * size or
   * rotation changes.
   * @param cb.width New width (pixels) of the video.
   * @param cb.height New height (pixels) of the video.
   * @param cb.roation New height (pixels) of the video.
   */
  on(
    evt: 'videoSizeChanged',
    cb: (uid: number, width: number, height: number, rotation: number) => void
  ): this;
  /** @zh-cn
   * @depreacted 该回调已废弃，请改用 `remoteVideoStateChanged`。
   *
   * 已显示首帧远端视频回调。
   *
   * 第一帧远端视频显示在视图上时，触发此调用。
   *
   * @param cb.uid 用户 ID，指定是哪个用户的视频流
   *
   * @param cb.width 视频流宽（px）
   *
   * @param cb.height 视频流高（px）
   *
   * @param cb.elapsed 从本地调用 {@link joinChannel} 到发生此事件过去的时间（毫秒)
   */
  /** @deprecated This callback is deprecated, please use
   * `remoteVideoStateChanged` instead.
   *
   * Occurs when the first remote video frame is rendered.
   *
   * The SDK triggers this callback when the first frame of the remote video
   * is displayed in the user's video window.
   *
   * @param cb.uid User ID of the remote user sending the video stream.
   * @param cb.width Width (pixels) of the video frame.
   * @param cb.height Height (pixels) of the video stream.
   * @param cb.elapsed Time elapsed (ms) from the local user calling the
   * {@link joinChannel} method until the SDK triggers this callback.
   */
  on(
    evt: 'firstRemoteVideoFrame',
    cb: (uid: number, width: number, height: number, elapsed: number) => void
  ): this;
  /** @zh-cn
   * 远端用户（通信场景）/主播（直播场景）加入当前频道回调。
   *
   * - 通信场景下，该回调提示有远端用户加入了频道，并返回新加入用户的 ID；如果加入之前，已经有其他用户在频道中了，新加入的用户也会收到这些已有用户加入频道的回调。
   * - 直播场景下，该回调提示有主播加入了频道，并返回该主播的 ID。如果在加入之前，已经有主播在频道中了，新加入的用户也会收到已有主播加入频道的回调。声网建议连麦主播不超过 17 人。
   *
   * 该回调在如下情况下会被触发：
   * - 远端用户/主播调用 {@link joinChannel} 方法加入频道
   * - 远端用户加入频道后调用 {@link setClientRole} 将用户角色改变为主播
   * - 远端用户/主播网络中断后重新加入频道
   * - 主播通过调用 {@link addInjectStreamUrl} 方法成功导入在线媒体流
   *
   * @note 直播场景下
   * - 主播间能相互收到新主播加入频道的回调，并能获得该主播的 `uid`
   * - 观众也能收到新主播加入频道的回调，并能获得该主播的 `uid`
   * - 当 Web 端加入直播频道时，只要 Web 端有推流，SDK 会默认该 Web 端为主播，并触发该回调。
   *
   *
   * @param cb.uid 新加入频道的远端用户/主播 ID
   *
   * @param cb.elapsed 从本地调用 {@link joinChannel} 到发生此事件过去的时间（毫秒)
   *
   */
  /** Occurs when a user or host joins the channel.
   *
   * The SDK triggers this callback under one of the following circumstances:
   * - A remote user/host joins the channel by calling the {@link joinChannel}
   * method.
   * - A remote user switches the user role to the host by calling the
   * {@link setClientRole} method after joining the channel.
   * - A remote user/host rejoins the channel after a network interruption.
   * - The host injects an online media stream into the channel by calling
   * the {@link addInjectStreamUrl} method.
   *
   * @note In the `1` (live streaming) profile:
   * - The host receives this callback when another host joins the channel.
   * - The audience in the channel receives this callback when a new host
   * joins the channel.
   * - When a web application joins the channel, the SDK triggers this
   * callback as long as the web application publishes streams.
   *
   * @param cb.uid User ID of the user or host joining the channel.
   * @param cb.elapsed Time delay (ms) from the local user calling the
   * {@link joinChannel} method until the SDK triggers this callback.
   */
  on(evt: 'userJoined', cb: (uid: number, elapsed: number) => void): this;
  /** @zh-cn
   * 远端用户离开当前频道回调。
   *
   * 用户离开频道有两个原因：
   * - 正常离开的时候，远端用户/主播会发送类似“再见”的消息。接收此消息后，判断用户离开频道。
   * - 超时掉线的依据是，在一定时间内（通信场景为 20 秒，直播场景稍有延时），用户没有收到对方的任何数据包，则判定为对方掉线。在网络较差的情况下，有可能会误报。声网建议使用信令系统来做可靠的掉线检测。
   *
   * @param cb.uid 离线用户或主播的用户 ID。
   *
   * @param cb.reason 离线原因
   *   - `0`：用户主动离开。
   *   - `1`：因过长时间收不到对方数据包，超时掉线。注意：由于 SDK 使用的是不可靠通道，也有可能对方主动离开本方没收到对方离开消息而误判为超时掉线。
   *   - `2`：用户身份从主播切换为观众。
   */
  /** Occurs when a remote user leaves the channel.
   * - uid: User ID of the user leaving the channel or going offline.
   * - reason: Reason why the user is offline:
   *  - 0: The user quits the call.
   *  - 1: The SDK times out and the user drops offline because no data packet
   * is received within a certain period of time.
   *  If the user quits the call and the message is not passed to the SDK
   * (due to an unreliable channel), the SDK assumes the user dropped offline.
   *  - 2: The client role switched from the host to the audience.
   * Reasons why the user is offline:
   * - Leave the channel: When the user leaves the channel, the user sends
   * a goodbye message. When the message is received, the SDK assumes that
   * the user leaves the channel.
   * - Drop offline: When no data packet of the user or host is received for
   * a certain period of time (20 seconds for the communication(`0`) profile,
   * and more for the `1` (live streaming) profile), the SDK assumes that the user
   * drops offline. Unreliable network connections may lead to false
   * detections, so we recommend using a signaling system for more reliable
   * offline detection.
   */
  on(evt: 'removeStream', cb: (uid: number, reason: number) => void): this;
  /** @zh-cn
   * 远端用户（通信场景）/主播（直播场景）离开当前频道回调。
   *
   * 用户离开频道有两个原因，即正常离开和超时掉线：
   * - 正常离开的时候，远端用户/主播会收到类似“再见”的消息，接收此消息后，判断用户离开频道
   * - 超时掉线的依据是，在一定时间内（约 20 秒），用户没有收到对方
   * 的任何数据包，则判定为对方掉线。在网络较差的情况下，有可能会误报。Agora 建议使用信令系统
   * 来做可靠的掉线检测
   *
   * @param cb.uid 主播 ID
   *
   * @param cb.reason 离线原因
   *  - 用户主动离开
   *  - 因过长时间收不到对方数据包，超时掉线。注意：由于 SDK 使用的是不可靠通道，也有可能对方
   * 主动离开本方没收到对方离开消息而误判为超时掉线
   *  - （直播场景下）用户身份从主播切换为观众
   *
   */
  /** Occurs when a remote user (Communication)/host (Live streaming) leaves
   * the channel.
   *
   * There are two reasons for users to become offline:
   * - Leave the channel: When the user/host leaves the channel, the user/host
   * sends a goodbye message. When this message is received, the SDK determines
   * that the user/host leaves the channel.
   * - Drop offline: When no data packet of the user or host is received for a
   * certain period of time, the SDK assumes that the user/host drops
   * offline. A poor network connection may lead to false detections, so we
   * recommend using the signaling system for reliable offline detection.
   *
   * @param cb.uid ID of the user or host who leaves the channel or goes
   * offline.
   * @param cb.reason Reason why the user goes offline:
   *  - The user left the current channel.
   *  - The SDK timed out and the user dropped offline because no data packet
   * was received within a certain period of time. If a user quits the call
   * and the message is not passed to the SDK (due to an unreliable channel),
   * the SDK assumes the user dropped offline.
   *  - (Live streaming only.) The client role switched from the host to the
   * audience.
   */
  on(evt: 'userOffline', cb: (uid: number, reason: number) => void): this;

  /** @zh-cn
   * @deprecated 该回调已废弃，请改用 `remoteAudioStateChanged`。
   *
   * 远端用户暂停/重新发送音频流回调。
   *
   * 该回调是由远端用户调用 {@link muteLocalAudioStream} 方法关闭或开启音频发送触发的。
   *
   * @note 当频道内的主播超过 20 人时，该回调不生效。
   *
   * @param cb.uid 远端用户 ID
   *
   * @param cb.muted 该用户是否暂停发送音频流
   *   - `true`：该用户已暂停发送音频流
   *   - `false`：该用户已重新发送音频流
   *
   */
  /** @deprecated This callback is deprecated, please use
   * `remoteAudioStateChanged` instead.
   *
   * Occurs when a remote user's audio stream is muted/unmuted.
   *
   * The SDK triggers this callback when the remote user stops or resumes
   * sending the audio stream by calling the {@link muteLocalAudioStream}
   * method.
   * - uid: User ID of the remote user.
   * - muted: Whether the remote user's audio stream is muted/unmuted:
   *  - true: Muted.
   *  - false: Unmuted.
   */
  on(evt: 'userMuteAudio', cb: (uid: number, muted: boolean) => void): this;

  /** @zh-cn
   * 远端用户暂停/重新发送视频流回调。
   *
   * 该回调是由远端用户调用 {@link muteLocalVideoStream} 方法关闭或开启音频发送触发的。
   *
   * @note 当频道内的主播超过 20 人时，该回调不生效。
   *
   * @param cb.uid 远端用户 ID
   *
   * @param cb.muted 该用户是否暂停发送视频流
   *   - `true`：该用户已暂停发送视频流
   *   - `false`：该用户已重新发送视频流
   *
   */
  /**
   * Occurs when a remote user's video stream playback pauses/resumes.
   *
   * The SDK triggers this callback when the remote user stops or resumes
   * sending the video stream by calling the {@link muteLocalVideoStream}
   * method.
   *
   * - uid: User ID of the remote user.
   * - muted: Whether the remote user's video stream playback is paused/resumed:
   *  - true: Paused.
   *  - false: Resumed.
   *
   * **Note**: This callback returns invalid when the number of users in a
   * channel exceeds 20.
   */
  on(evt: 'userMuteVideo', cb: (uid: number, muted: boolean) => void): this;
  /** @zh-cn
   * @deprecated 这个回调已被废弃，请改用 `remoteVideoStateChanged` 回调。
   *
   * 远端用户开启/关闭视频模块回调。
   *
   * 该回调是由远端用户调用 {@link enableVideo} 或 {@link disableVideo} 方法开启或关闭视频模块触发的。
   *
   * @note Agora 视频模块指视频处理过程，而不是 SDK 中的模块实物。发送视频流时，视频模块指视频采集、前处理、编码等处理过程；接收视频流时，视频模块指视频解码、后处理、渲染/播放等处理过程。
   *
   *
   * @param cb.uid 用户 ID
   * @param cb.enabled 该用户是否开启或关闭视频模块：
   *   - `true`：该用户已启用视频模块。启用后，该用户可以进行视频通话或直播。
   *   - `false`：该用户已关闭视频模块。关闭后，该用户只能进行语音通话或直播，不能显示、发送自己的视频，也不能接收、显示别人的视频。
   */
  /**
   * @deprecated This callback is deprecated. Use the remoteVideoStateChanged
   * callback instead.
   *
   * Occurs when a specific remote user enables/disables the video module.
   *
   * The SDK triggers this callback when the remote user enables or disables
   * the video module by calling the {@link enableVideo} or
   * {@link disableVideo} method.
   * - uid: User ID of the remote user.
   * - enabled: Whether the remote user enables/disables the video module:
   *  - true: Enable. The remote user can enter a video session.
   *  - false: Disable. The remote user can only enter a voice session, and
   * cannot send or receive any video stream.
   */
  on(evt: 'userEnableVideo', cb: (uid: number, enabled: boolean) => void): this;
  /** @zh-cn
   * @deprecated 这个回调已被废弃，请改用 `remoteVideoStateChanged` 回调。
   *
   * 远端用户开启/关闭本地视频采集。
   *
   * 该回调是由远端用户调用 {@link enableLocalVideo} 方法开启或关闭视频采集触发的。
   *
   *
   * @param cb.uid 用户 ID
   *
   * @param cb.enabled 该用户是否开启或关闭本地视频采集：
   *   - `true`：该用户已启用本地视频采集。启用后，其他用户可以接收到该用户的视频流。
   *   - `false`：该用户已关闭视频采集。关闭后，该用户仍然可以接收其他用户的视频流，但其他用户接收不到该用户的视频流。
   */
  /**
   * @deprecated This callback is deprecated. Use the remoteVideoStateChanged
   * callback instead.
   *
   * Occurs when a specified remote user enables/disables the local video
   * capturing function.
   *
   * The SDK triggers this callback when the remote user resumes or stops
   * capturing the video stream by calling the {@link enableLocalVideo} method.
   * - uid: User ID of the remote user.
   * - enabled: Whether the remote user enables/disables the local video
   * capturing function:
   *  - true: Enable. Other users in the channel can see the video of this
   * remote user.
   *  - false: Disable. Other users in the channel can no longer receive the
   * video stream from this remote user, while this remote user can still
   * receive the video streams from other users.
   */
  on(evt: 'userEnableLocalVideo', cb: (uid: number, enabled: boolean) => void): this;
  /** @zh-cn
   * @deprecated 该回调已废弃。请改用 localVideoStateChanged 回调。
   *
   * 摄像头就绪回调。
   */
   /**
    * @deprecated Replaced by the localVideoStateChanged callback.
    *
    * Occurs when the camera turns on and is ready to capture the video.
    */
  on(evt: 'cameraReady', cb: () => void): this;
  /** @zh-cn
   * @deprecated 该回调已废弃。请改用 localVideoStateChanged 回调。
   *
   * 视频停止播放回调。
   */
  /**
   * @deprecated Replaced by the localVideoStateChanged callback.
   *
   * Occurs when the video stops playing.
   */
  on(evt: 'videoStopped', cb: () => void): this;
  /** @zh-cn
   * 网络连接中断，且 SDK 无法在 10 秒内连接服务器回调。
   *
   * @note SDK 在调用 {@link joinChannel} 后，无论是否加入成功，只要 10 秒和服务器无法连接
   * 就会触发该回调。如果 SDK 在断开连接后，20 分钟内还是没能重新加入频道，SDK 会停止尝试重连。
   */
  /** Occurs when the SDK cannot reconnect to Agora's edge server 10 seconds
   * after its connection to the server is interrupted.
   *
   * The SDK triggers this callback when it cannot connect to the server 10
   * seconds after calling the {@link joinChannel} method, whether or not it
   * is in the channel.
   * - If the SDK fails to rejoin the channel 20 minutes after being
   * disconnected from Agora's edge server, the SDK stops rejoining the
   * channel.
   */
  on(evt: 'connectionLost', cb: () => void): this;
  // on(evt: 'connectionInterrupted', cb: () => void): this;
  /** @zh-cn
   * @deprecated 该回调已废弃。请改用 connectionStateChanged 回调。
   *
   * 网络连接已被服务器禁止回调。
   *
   * 当你被服务端禁掉连接的权限时，会触发该回调。
   */
  /**
   * @deprecated Replaced by the connectionStateChanged callback.
   *
   * Occurs when your connection is banned by the Agora Server.
   */
  on(evt: 'connectionBanned', cb: () => void): this;
  // on(evt: 'refreshRecordingServiceStatus', cb: () => void): this;
  /** @zh-cn
   * 接收到对方数据流消息的回调。
   *
   * 该回调表示本地用户收到了远端用户调用 {@link sendStreamMessage} 方法发送的流消息。
   *
   *
   * @param cb.uid 用户 ID
   *
   * @param cb.streamId 数据流 ID
   *
   * @param cb.msg 接收到的流消息
   *
   * @param cb.len 流消息数据长度
   */
  /** Occurs when the local user receives the data stream from the remote
   * user within five seconds.
   *
   * The SDK triggers this callback when the local user receives the stream
   * message that the remote user sends by calling the
   * {@link sendStreamMessage} method.
   * @param cb.uid User ID of the remote user sending the message.
   * @param cb.streamId Stream ID.
   * @param cb.msg The data received bt the local user.
   * @param cb.len Length of the data in bytes.
   */
  on(
    evt: 'streamMessage',
    cb: (uid: number, streamId: number, msg: string, len: number) => void
  ): this;
  /** @zh-cn
   * 接收对方数据流小时发生错误回调。
   *
   * 该回调表示本地用户未收到远端用户调用 {@link sendStreamMessage} 方法发送的流消息。
   *
   *
   * @param cb.uid 用户 ID
   *
   * @param cb.streamId 数据流 ID
   *
   * @param cb.err 错误代码
   *
   * @param cb.missed 丢失的消息数量
   *
   * @param cb.cached 数据流中断后，后面缓存的消息数量
   */
  /** Occurs when the local user does not receive the data stream from the
   * remote user within five seconds.
   *
   * The SDK triggers this callback when the local user fails to receive the
   * stream message that the remote user sends by calling the
   * {@link sendStreamMessage} method.
   *
   * @param cb.uid User ID of the remote user sending the message.
   * @param cb.streamId Stream ID.
   * @param cb.err Error code.
   * @param cb.missed Number of the lost messages.
   * @param cb.cached Number of incoming cached messages when the data stream
   * is interrupted.
   */
  on(evt: 'streamMessageError', cb: (
    uid: number,
    streamId: number,
    code: number,
    missed: number,
    cached: number
  ) => void): this;
  /** @zh-cn
   * 媒体引擎成功启动的回调。
   */
  /** Occurs when the media engine call starts. */
  on(evt: 'mediaEngineStartCallSuccess', cb: () => void): this;
  /** @zh-cn
   * Token 已过期回调。
   *
   * 调用 {@link joinChannel} 时如果指定了 Token，由于 Token 具有一定的时效，在通话过程中 SDK 可能由于网络原因和服务器失去连接，重连时可能需要新的 Token。
   *
   * 该回调通知 App 需要生成新的 Token，并需调用 {@link renewToken} 为 SDK 指定新的 Token。
   */
  /** Occurs when the token expires.
   *
   * After a token(channel key) is specified by calling the {@link joinChannel}
   * method,
   * if the SDK losses connection with the Agora server due to network issues,
   * the token may expire after a certain period
   * of time and a new token may be required to reconnect to the server.
   *
   * This callback notifies the application to generate a new token. Call
   * the {@link renewToken} method to renew the token
   */
  on(evt: 'requestChannelKey', cb: () => void): this;
  /** @zh-cn
   * 已发送本地音频首帧回调。
   *
   * @deprecated 该回调自 v3.2.0 已废弃，请改用 `firstLocalAudioFramePublished`。
   *
   * @param cb.elapsed 从本地用户调用 {@link joinChannel} 方法直至该回调被触发的延迟（毫秒）。
   */
  /** Occurs when the engine sends the first local audio frame.
   *
   * @deprecated This callback is deprecated from v3.2.0. Use
   * the `firstLocalAudioFramePublished` instead.
   *
   * - elapsed: Time elapsed (ms) from the local user calling
   * {@link joinChannel} until the
   * SDK triggers this callback.
   */
  on(evt: 'firstLocalAudioFrame', cb: (elapsed: number) => void): this;
  /** @zh-cn
   * @deprecated 该回调已废弃，请改用 `remoteAudioStateChanged`。
   *
   * 已接收远端音频首帧回调。
   *
   * @param cb.uid 发送音频帧的远端用户的 ID
   *
   * @param cb.elapsed 从调用 {@link joinChannel} 方法直至该回调被触发的延迟（毫秒）
   */
  /**
   * @deprecated This callback is deprecated. Please use
   * `remoteAudioStateChanged` instead.
   *
   * Occurs when the engine receives the first audio frame from a specific
   * remote user.
   * - uid: User ID of the remote user.
   * - elapsed: Time elapsed (ms) from the local user calling
   * {@link joinChannel} until the
   * SDK triggers this callback.
   */
  on(
    evt: 'firstRemoteAudioFrame',
    cb: (uid: number, elapsed: number) => void
  ): this;
  /** @zh-cn
   * @deprecated 该回调已废弃，请改用 `remoteAudioStateChanged`。
   *
   * 已解码远端音频首帧的回调
   *
   * SDK 完成远端音频首帧解码，并发送给音频模块用以播放时，会触发此回调。有两种情况：
   * - 远端用户首次上线后发送音频
   * - 远端用户音频离线再上线发送音频。音频离线指本地在 15 秒内没有收到音频包，可能有如下原因：
   *  - 远端用户离开频道
   *  - 远端用户掉线
   *  - 远端用户停止发送音频流（通过调用 {@link muteLocalAudioStream} 方法）
   *  - 远端用户关闭音频 （通过调用 {@link disableAudio} 方法）
   *
   *
   * @param cb.uid 用户 ID，指定是哪个用户的音频流
   *
   * @param cb.elapsed 从本地用户调用 {@link joinChannel} 方法加入频道直至该回调触发的延迟，单位为毫秒
   *
   */
  /** @deprecated This callback is deprecated, please use
   * `remoteAudioStateChanged` instead.
   *
   * Occurs when the engine receives the first audio frame from a specified
   * remote user.
   * @param cb.uid User ID of the remote user sending the audio stream.
   * @param cb.elapsed The time elapsed (ms) from the local user calling the
   * {@link joinChannel} method until the SDK triggers this callback.
   */
  on(evt: 'firstRemoteAudioDecoded', cb: (uid: number, elapsed: number) => void): this;
  /** @zh-cn
   * 检测到活跃用户回调。
   *
   * 如果用户开启了 {@link enableAudioVolumeIndication} 功能，则当音量检测模块监测到频道内有新的活跃用户说话时，会通过本回调返回该用户的 `uid`。
   *
   * @param cb.uid 当前时间段内声音最大的用户的 `uid`（本地用户 `uid` 为 `0`）
   */
  /**
   * Reports which user is the loudest speaker.
   *
   * This callback returns the user ID of the user with the highest voice
   * volume during a period of time, instead of at the moment.
   *
   * @note To receive this callback, you need to call the
   * {@link enableAudioVolumeIndication} method.
   *
   * @param cb.uid User ID of the active speaker. A uid of 0 represents the
   * local user.
   * If the user enables the audio volume indication by calling the
   * {@link enableAudioVolumeIndication} method, this callback returns the uid
   * of the
   * active speaker detected by the audio volume detection module of the SDK.
   *
   */
  on(evt: 'activeSpeaker', cb: (uid: number) => void): this;

  /** @zh-cn
   * 用户角色已切换回调。
   *
   * 回调由本地用户在加入频道后调用 {@link setClientRole} 改变用户角色触发的。
   *
   * @param cb.oldRole 切换前的角色
   *
   * @param cb.newRole 切换后的角色
   */
  /** Occurs when the user role switches in a live streaming.
   *
   * For example,
   * from a host to an audience or vice versa.
   *
   * This callback notifies the application of a user role switch when the
   * application calls the {@link setClientRole} method.
   *
   * @param cb.oldRole The old role, see {@link ClientRoleType}
   * @param cb.newRole The new role, see {@link ClientRoleType}
   */
  on(
    evt: 'clientRoleChanged',
    cb: (oldRole: ClientRoleType, newRole: ClientRoleType) => void
  ): this;
  /** @zh-cn
   * 回放、录音设备、或 App 的音量发生改变。
   *
   * @param cb.deviceType 设备类型
   *
   * @param cb.volume 当前音量（分贝）。取值范围 [0, 255]
   *
   * @param cb.muted 音频设备是否为静音状态
   *   - `true`：音频设备已静音
   *   - `false`：音频设备未被静音
   */
  /** Occurs when the volume of the playback device, microphone, or
   * application changes.
   *
   * @param cb.deviceType Device type.
   * See {@link AgoraRtcEngine.MediaDeviceType MediaDeviceType}.
   * @param cb.volume Volume of the device. The value ranges between 0 and 255.
   * @param cb.muted
   * - true: The audio device is muted.
   * - false: The audio device is not muted.
   */
on(
  evt: 'audioDeviceVolumeChanged',
  cb: (deviceType: MediaDeviceType, volume: number, muted: boolean) => void
): this;
  /** @zh-cn
   * 屏幕共享对象成功加入频道回调。
   *
   * @param cb.uid 该对象的用户 ID
   */
  /** Occurs when the local video source joins the channel.
   * @param cb.uid The User ID.
   */
  on(evt: 'videoSourceJoinedSuccess', cb: (uid: number) => void): this;
  /** @zh-cn
   * 屏幕共享对象 Token 已过期回调。
   */
  /** Occurs when the token expires. */
  on(evt: 'videoSourceRequestNewToken', cb: () => void): this;
  /** @zh-cn
   * 屏幕共享对象离开频道回调。
   */
  /** Occurs when the video source leaves the channel.
   */
  on(evt: 'videoSourceLeaveChannel', cb: () => void): this;
  /** Reports the statistics of the audio stream of the local video source.
   *
   * The SDK triggers this callback once every two seconds.
   *
   * @param cb.stats The statistics of the local audio stream.
   */
  on(evt: 'videoSourceLocalAudioStats', cb: (stats: LocalAudioStats) => void): this;
  /** Reports the statistics of the video stream of the local video source.
   *
   * The SDK triggers this callback once every two seconds for each
   * user/host. If there are multiple users/hosts in the channel, the SDK
   * triggers this callback as many times.
   *
   * @note
   * If you have called the {@link videoSourceEnableDualStreamMode}
	 * method, this callback
   * reports the statistics of the high-video
   * stream (high bitrate, and high-resolution video stream).
   *
   * @param cb.stats Statistics of the local video stream.
   */
  on(evt: 'videoSourceLocalVideoStats', cb: (stats: LocalVideoStats) => void): this;
  /** Occurs when the video size or rotation of the video source
   * changes.
   *
   * @param cb.uid User ID of the remote video source or local video source
   * (`0`) whose video size
   * or rotation changes.
   * @param cb.width New width (pixels) of the video.
   * @param cb.height New height (pixels) of the video.
   * @param cb.rotation New rotation of the video [0 to 360).
   */
  on(evt: 'videoSourceVideoSizeChanged', cb: (uid: number, width: number, height: number, rotation: number) => void): this;
  /**
   * Occurs when the local video state of the video source changes.
   *
   * This callback indicates the state of the local video stream, including
   * camera capturing and video encoding, and allows you to troubleshoot
   * issues when exceptions occur.
   *
   * The SDK triggers the
   * `videoSourceLocalVideoStateChanged(LOCAL_VIDEO_STREAM_STATE_FAILED, LOCAL_VIDEO_STREAM_ERROR_CAPTURE_FAILURE)`
   * callback in the
   * following situations:
   * - The application exits to the background, and the system recycles
   * the camera.
   * - The camera starts normally, but the captured video is not output for
   * four seconds.
   *
   * When the camera outputs the captured video frames, if all the video
   * frames are the same for 15 consecutive frames, the SDK triggers the
   * `videoSourceLocalVideoStateChanged(LOCAL_VIDEO_STREAM_STATE_CAPTURING, LOCAL_VIDEO_STREAM_ERROR_CAPTURE_FAILURE)`
   * callback. Note that the
   * video frame duplication detection is only available for video frames
   * with a resolution greater than 200 × 200, a frame rate greater than
   * or equal to 10 fps,
   * and a bitrate less than 20 Kbps.
   *
   * @note For some Windows device models, the SDK will not trigger this
   * callback when the state of the local video changes while the local video
   * capturing device is in use, so you have to make your own timeout judgment.
   *
   * @param cb.localVideoState The local video state.
   * @param cb.error The detailed error information of the local video.
   */
  on(evt: 'videoSourceLocalVideoStateChanged', cb: (state: LOCAL_VIDEO_STREAM_STATE, error: LOCAL_VIDEO_STREAM_ERROR) => void): this;
  /**
   * Occurs when the local audio state of the video source changes.
   *
   * This callback indicates the state change of the local audio stream,
   * including the state of the audio recording and encoding, and allows you
   * to troubleshoot issues when exceptions occur.
   *
   * @param cb.state State of the local audio.
   * @param cb.error The error information of the local audio.
   */
  on(evt: 'videoSourceLocalAudioStateChanged', cb: (state: LOCAL_AUDIO_STREAM_STATE, error: LOCAL_AUDIO_STREAM_ERROR) => void): this;
  /** @zh-cn
   * 远端用户视频流状态发生改变回调。
   *
   * @param cb.uid 发生视频流状态改变的远端用户的用户 ID。
   *
   * @param cb.state 远端视频流状态
   *
   * @param cb.reason 远端视频流状态改变的具体原因
   *
   * @param cb.elapsed 从本地用户调用 {@link joinChannel} 方法到发生本事件经历的时间，单位为 ms。
   */
  /** Occurs when the remote video state changes.
   *
   * @param cb.uid ID of the user whose video state changes.
   * @param cb.state State of the remote video.
   * See {@link RemoteVideoState}.
   * @param cb.reason The reason of the remote video state change.
   * See {@link RemoteVideoStateReason}
   * @param cb.elapsed Time elapsed (ms) from the local user calling the
   * {@link joinChannel} method until the SDK triggers this callback.
   */
  on(
    evt: 'remoteVideoStateChanged',
    cb: (
      uid: number,
      state: RemoteVideoState,
      reason: RemoteVideoStateReason,
      elapsed: number
    ) => void
  ): this;
  /** @zh-cn
   * 相机对焦区域已改变回调。
   *
   * @param cb.x 发生改变的对焦区域相对于左上角的 x 坐标。
   *
   * @param cb.y 发生改变的对焦区域相对于左上角的 y 坐标。
   *
   * @param cb.width 发生改变的对焦区域的宽度 (px)。
   *
   * @param cb.height 发生改变的对焦区域的高度 (px)。
   */
  /** Occurs when the camera focus area changes.
   * - x: x coordinate of the changed camera focus area.
   * - y: y coordinate of the changed camera focus area.
   * - width: Width of the changed camera focus area.
   * - height: Height of the changed camera focus area.
   */
  on(evt: 'cameraFocusAreaChanged', cb: (x: number, y: number, width: number, height: number) => void): this;
  /** @zh-cn
   * 摄像头曝光区域已改变回调。
   *
   * @param cb.x 发生改变的曝光区域相对于左上角的 x 坐标。
   *
   * @param cb.y 发生改变的曝光区域相对于左上角的 y 坐标。
   *
   * @param cb.width 发生改变的曝光区域的宽度 (px)。
   *
   * @param cb.height 发生改变的曝光区域的高度 (px)。
   */
  /** Occurs when the camera exposure area changes.
   * - x: x coordinate of the changed camera exposure area.
   * - y: y coordinate of the changed camera exposure area.
   * - width: Width of the changed camera exposure area.
   * - height: Height of the changed camera exposure area.
   */
  on(evt: 'cameraExposureAreaChanged', cb: (x: number, y: number, width: number, height: number) => void): this;
  /** @zh-cn
   * Token 服务即将过期回调。
   *
   * 在调用 {@link joinChannel} 时如果指定了 Token，由于 Token 具有一定的时效，在通话过程中如果 Token 即将失效，SDK 会提前 30 秒触发该回调，提醒 App 更新 Token。当收到该回调时，用户需要重新在服务端生成新的 Token，然后调用 {@link renewToken} 将新生成的 Token 传给 SDK。
   *
   * @param cb.token 即将服务失效的 Token
   */
  /** Occurs when the token expires in 30 seconds.
   *
   * The user becomes offline if the token used in the {@link joinChannel}
   * method expires. The SDK triggers this callback 30 seconds
   * before the token expires to remind the application to get a new token.
   * Upon receiving this callback, generate a new token
   * on the server and call the {@link renewToken} method to pass the new
   * token to the SDK.
   *
   * @param cb.token The token that expires in 30 seconds.
   */
  on(evt: 'tokenPrivilegeWillExpire', cb: (token: string) => void): this;

  /** @zh-cn
   * @deprecated 该回调已废弃，请改用 `rtmpStreamingStateChanged`。
   *
   * 开启旁路推流的结果回调。
   *
   * 该回调返回 {@link addPublishStreamUrl} 方法的调用结果。用于通知主播是否推流成功。如果不成功，你可以在 error 参数中查看详细的错误信息。
   *
   * @param cb.url 新增的推流地址。
   *
   * @param cb.error 详细的错误信息
   *   - `0`：推流成功
   *   - `1`：推流失败
   *   - `2`：参数错误。如果你在调用 {@link addPublishStreamUrl} 前没有调用 {@link setLiveTranscoding} 配置 `LiveTranscoding`，SDK 会返回该错误
   *   - `10`：推流超时未成功
   *   - `19`：推流地址已经在推流
   *   - `130`：推流已加密不能推流
   */
  /** @deprecated This callback is deprecated. Please use
   * `rtmpStreamingStateChanged` instead.
   *
   * Reports the result of CDN live streaming.
   *
   * - url: The RTMP URL address.
   * - error: Error code:
   *  - 0: The publishing succeeds.
   *  - 1: The publishing fails.
   *  - 2: Invalid argument used. For example, you did not call
   * {@link setLiveTranscoding} to configure LiveTranscoding before
   * calling {@link addPublishStreamUrl}.
   *  - 10: The publishing timed out.
   *  - 19: The publishing timed out.
   *  - 130: You cannot publish an encrypted stream.
   */
  on(evt: 'streamPublished', cb: (url: string, error: number) => void): this;

  /** @zh-cn
   * 停止旁路推流的结果回调。
   *
   * 该回调返回 {@link removePublishStreamUrl} 方法的调用结果。用于通知主播是否停止推流成功。
   *
   * @param cb.url 主播停止推流的 RTMP 地址。
   */
  /** @deprecated This callback is deprecated. Please use
   * `rtmpStreamingStateChanged` instead.
   *
   * This callback indicates whether you have successfully removed an RTMP
   * stream from the CDN.
   *
   * Reports the result of calling the {@link removePublishStreamUrl} method.
   * - url: The RTMP URL address.
   */
  on(evt: 'streamUnpublished', cb: (url: string) => void): this;
  /** @zh-cn
   * RTMP 推流状态发生改变回调。
   *
   * 该回调返回本地用户调用 {@link addPublishStreamUrl} 或 {@link removePublishStreamUrl}
   * 方法的结果。
   *
   * RTMP 推流状态发生改变时，SDK 会触发该回调，并在回调中明确状态发生改变的 URL 地址及
   * 当前推流状态。该回调方便推流用户了解当前的推流状态；推流出错时，你可以通过返回的错误码
   * 了解出错的原因，方便排查问题。
   *
   *
   * @param cb.url 推流状态发生改变的 URL 地址
   * @param cb.state 推流状态：
   * - `0`: 推流未开始或已结束。成功调用 {@link removePublishStreamUrl} 后会返回该状态。
   * - `1`: 正在连接 Agora 推流服务器和 RTMP 服务器。调用 {@link addPublishStreamUrl}
   * 后会返回该状态。
   * - `2`: 推流正在进行。成功推流后，会返回该状态。
   * - `3`: 正在恢复推流。当 CDN 出现异常，或推流短暂中断时，SDK 会自动尝试恢复推流，并返回该状态。
   *  - 如成功恢复推流，则进入状态 `2`。
   *  - 如服务器出错或 60 秒内未成功恢复，则进入状态 `4`。如果觉得 60 秒太长，也可以主动调用
   * {@link addPublishStreamUrl}，再调用 {@link removePublishStreamUrl} 尝试重连。
   * - `4`: 推流失败。失败后，你可以通过返回的错误码排查错误原因，也可以再次调用
   * {@link addPublishStreamUrl} 重新尝试推流。
   * @param cb.code 推流错误码：
   * - `0`: 推流成功。
   * - `1`: 参数无效。请检查输入参数是否正确。
   * - `2`: 推流已加密，不能推流。
   * - `3`: 推流超时未成功。可调用 {@link addPublishStreamUrl} 重新推流。
   * - `4`: 推流服务器出现错误。请调用 {@link addPublishStreamUrl} 重新推流。
   * - `5`: RTMP 服务器出现错误。
   * - `6`: 推流请求过于频繁。
   * - `7`: 单个主播的推流地址数目达到上线 10。请删掉一些不用的推流地址再增加推流地址。
   * - `8`: 主播操作不属于自己的流。例如更新其他主播的流参数、停止其他主播的流。请检查 App 逻辑。
   * - `9`: 服务器未找到这个流。
   * - `10`: 推流地址格式有错误。请检查推流地址格式是否正确。
   */
  /**
   * Occurs when the state of the RTMP streaming changes.
   *
   * The SDK triggers this callback to report the result of the local user
   * calling the {@link addPublishStreamUrl} and {@link removePublishStreamUrl}
   * method.
   *
   * This callback indicates the state of the RTMP streaming. When exceptions
   * occur, you can troubleshoot issues by referring to the detailed error
   * descriptions in the `code` parameter.
   * @param cb.url The RTMP URL address.
   * @param cb.state The RTMP streaming state:
   * - `0`: The RTMP streaming has not started or has ended. This state is also
   * triggered after you remove an RTMP address from the CDN by calling
   * {@link removePublishStreamUrl}.
   * - `1`: The SDK is connecting to Agora's streaming server and the RTMP
   * server. This state is triggered after you call the
   * {@link addPublishStreamUrl} method.
   * - `2`: The RTMP streaming publishes. The SDK successfully publishes the
   * RTMP streaming and returns this state.
   * - `3`: The RTMP streaming is recovering. When exceptions occur to the CDN,
   * or the streaming is interrupted, the SDK tries to resume RTMP streaming
   * and returns this state.
   *  - If the SDK successfully resumes the streaming, `2` returns.
   *  - If the streaming does not resume within 60 seconds or server errors
   * occur, `4` returns. You can also reconnect to the server by calling the
   * {@link removePublishStreamUrl} and then {@link addPublishStreamUrl}
   * method.
   * - `4`: The RTMP streaming fails. See the `code` parameter for the
   * detailed error information. You can also call the
   * {@link addPublishStreamUrl} method to publish the RTMP streaming again.
   * @param cb.code The detailed error information:
   * - `0`: The RTMP streaming publishes successfully.
   * - `1`: Invalid argument used.
   * - `2`: The RTMP streams is encrypted and cannot be published.
   * - `3`: Timeout for the RTMP streaming. Call the
   * {@link addPublishStreamUrl} to publish the stream again.
   * - `4`: An error occurs in Agora's streaming server. Call the
   * {@link addPublishStreamUrl} to publish the stream again.
   * - `5`: An error occurs in the RTMP server.
   * - `6`: The RTMP streaming publishes too frequently.
   * - `7`: The host publishes more than 10 URLs. Delete the unnecessary URLs
   * before adding new ones.
   * - `8`: The host manipulates other hosts' URLs. Check your app
   * logic.
   * - `9`: Agora's server fails to find the RTMP stream.
   * - `10`: The format of the stream's URL address is not supported. Check
   * whether the URL format is correct.
   */
  on(evt: 'rtmpStreamingStateChanged', cb: (url: string, state: number, code: number) => void): this;

  /** @zh-cn
   * 旁路推流设置被更新回调。该
   *
   * 回调用于通知主播 CDN 转码已成功更新。
   *
   * {@link setLiveTranscoding} 方法中的转码合图参数（`LiveTranscoding`）更新时，`transcodingUpdated` 回调会被触发并向主播报告更新信息。
   *
   * @note 首次调用 {@link setLiveTranscoding} 方法设置转码合图参数（`LiveTranscoding`）时，不会触发此回调。
   */
  /** Occurs when the publisher's transcoding is updated.
   *
   * When the LiveTranscoding class in the setLiveTranscoding method updates,
   * the SDK triggers the transcodingUpdated callback to report the update
   * information to the local host.
   *
   * **Note**: If you call the {@link setLiveTranscoding} method to set the
   * LiveTranscoding class for the first time, the SDK does not trigger the
   * transcodingUpdated callback.
   */
  on(evt: 'transcodingUpdated', cb: () => void): this;
  /** @zh-cn
   * 导入在线媒体流状态回调。
   *
   * 该回调表明向直播导入的外部视频流的状态。
   *
   * @warning 客户端输入在线媒体流功能即将停服。如果你尚未集成该功能，Agora 建议你不要使用。详见《部分服务下架计划》。
   *
   * @param cb.url 导入进直播的外部视频源的 URL 地址。
   *
   * @param cb.uid 用户 ID。
   *
   * @param cb.status 导入的外部视频源状态
   *   - `0`：外部视频流导入成功
   *   - `1`：外部视频流已存在
   *   - `2`：外部视频流导入未经授权
   *   - `3`：导入外部视频流超时
   *   - `4`：外部视频流导入失败
   *   - `5`：外部视频流停止导入失败
   *   - `6`：未找到要停止导入的外部视频流
   *   - `7`：要停止导入的外部视频流未经授权
   *   - `8`：停止导入外部视频流超时
   *   - `9`：停止导入外部视频流失败
   *   - `10`：导入的外部视频流被中断
   */
  /** Occurs when a voice or video stream URL address is added to a live
   * broadcast.
   *
   * @warning Agora will soon stop the service for injecting online media
   * streams on the client. If you have not implemented this service, Agora
   * recommends that you do not use it.
   *
   * - url: The URL address of the externally injected stream.
   * - uid: User ID.
   * - status: State of the externally injected stream:
   *  - 0: The external video stream imported successfully.
   *  - 1: The external video stream already exists.
   *  - 2: The external video stream to be imported is unauthorized.
   *  - 3: Import external video stream timeout.
   *  - 4: Import external video stream failed.
   *  - 5: The external video stream stopped importing successfully.
   *  - 6: No external video stream is found.
   *  - 7: No external video stream is found.
   *  - 8: Stop importing external video stream timeout.
   *  - 9: Stop importing external video stream failed.
   *  - 10: The external video stream is corrupted.
   *
   */
  on(
    evt: 'streamInjectStatus',
    cb: (url: string, uid: number, status: number) => void
  ): this;
  /** @zh-cn
   * 本地发布流已回退为音频流回调。
   *
   * 如果你调用了设置本地推流回退选项 {@link setLocalPublishFallbackOption} 并将 `option` 设置为 `2` 时，当上行网络环境不理想、本地发布的媒体流回退为音频流时，或当上行网络改善、媒体流恢复为音视频流时，会触发该回调。
   *
   * 如果本地推流已回退为音频流，远端的 App 上会收到 `userMuteVideo` 的回调事件。
   *
   *
   * @param cb.isFallbackOrRecover 本地推流已回退或恢复：
   *  - `true`：由于网络环境不理想，本地发布的媒体流已回退为音频流
   *  - `false`：由于网络环境改善，发布的音频流已恢复为音视频流
   */
  /** Occurs when the locally published media stream falls back to an
   * audio-only stream due to poor network conditions or switches back
   * to the video after the network conditions improve.
   *
   * If you call {@link setLocalPublishFallbackOption} and set option as
   * AUDIO_ONLY(2), the SDK triggers this callback when
   * the locally published stream falls back to audio-only mode due to poor
   * uplink conditions, or when the audio stream switches back to
   * the video after the uplink network condition improves.
   *
   * - isFallbackOrRecover: Whether the locally published stream falls back to
   * audio-only or switches back to the video:
   *  - true: The locally published stream falls back to audio-only due to poor
   * network conditions.
   *  - false: The locally published stream switches back to the video after
   * the network conditions improve.
   */
  on(evt: 'localPublishFallbackToAudioOnly', cb: (isFallbackOrRecover: boolean) => void): this;
  /** @zh-cn
   * 远端订阅流已回退为音频流回调。
   *
   * 如果你调用了设置远端订阅流回退选项 {@link setRemoteSubscribeFallbackOption} 并将 `option` 设置为 `2` 时， 当下行网络环境不理想、仅接收远端音频流时，或当下行网络改善、恢复订阅音视频流时，会触发该回调。
   *
   * 远端订阅流因弱网环境不能同时满足音视频而回退为小流时，你可以使用 `remoteVideoStats` 回调来监控远端视频大小流的切换。
   *
   *
   * @param cb.uid 远端用户的 ID
   *
   * @param cb.isFallbackOrRecover 远端订阅流已回退或恢复：
   *   - `true`：由于网络环境不理想，远端订阅流已回退为音频流
   *   - `false`：由于网络环境改善，订阅的音频流已恢复为音视频流
   */
  /** Occurs when the remote media stream falls back to audio-only stream due
   * to poor network conditions or switches back to the video stream after the
   * network conditions improve.
   *
   * If you call {@link setRemoteSubscribeFallbackOption} and set option as
   * AUDIO_ONLY(2), the SDK triggers this callback when
   * the remotely subscribed media stream falls back to audio-only mode due to
   * poor uplink conditions, or when the remotely subscribed media stream
   * switches back to the video after the uplink network condition improves.
   * @param cb.uid ID of the remote user sending the stream.
   * @param cb.isFallbackOrRecover Whether the remote media stream falls back
   * to audio-only or switches back to the video:
   *  - `true`: The remote media stream falls back to audio-only due to poor
   * network conditions.
   *  - `false`: The remote media stream switches back to the video stream
   * after the network conditions improved.
   */
  on(evt: 'remoteSubscribeFallbackToAudioOnly', cb: (
    uid: number,
    isFallbackOrRecover: boolean
  ) => void): this;
  /** @zh-cn
   * @deprecated 这个回调已被废弃，请改用 `localAuidoStateChanged` 回调。
   *
   * 麦克风状态已改变回调。
   *
   * 该回调由本地用户开启或关闭本地音频采集触发的。
   *
   * @param cb.enabled 是否开启麦克风：
   *   - `true`：麦克风已启用
   *   - `false`：麦克风已禁用
   */
  /**
   * @deprecated This callback is deprecated. Use the localAudioStateChanged
   * callback instead.
   *
   * Occurs when the microphone is enabled/disabled.
   * - enabled: Whether the microphone is enabled/disabled:
   *  - true: Enabled.
   *  - false: Disabled.
   */
  on(evt: 'microphoneEnabled', cb: (enabled: boolean) => void): this;
  /** @zh-cn
   * 网络连接状态已改变回调。
   *
   * 该回调在网络连接状态发生改变的时候触发，并告知用户当前的网络连接状态，和引起网络状态改变的原因。
   *
   * @param cb.state 当前的网络连接状态
   *
   * @param cb.reason 引起当前网络连接状态发生改变的原因
   */
  /** Occurs when the connection state between the SDK and the server changes.
   * @param cb.state The connection state, see {@link ConnectionState}.
   * @param cb.reason The connection reason, see {@link ConnectionState}.
   */
  on(evt: 'connectionStateChanged', cb: (
    state: ConnectionState,
    reason: ConnectionChangeReason
  ) => void): this;
  /** @zh-cn
   * 本地用户成功注册 User Account 回调。
   *
   * 本地用户成功调用 {@link registerLocalUserAccount} 方法注册用户 User Account，或调用 {@link joinChannelWithUserAccount} 加入频道后，SDK 会触发该回调，并告知本地用户的 UID 和 User Account。包含如下参数：
   *
   * @param cb.uid 本地用户的 UID
   *
   * @param cb.userAccount 本地用户的 User account
   */
  /** Occurs when the local user successfully registers a user account by
   * calling the {@link registerLocalUserAccount} method.
   * This callback reports the user ID and user account of the local user.
   * - uid: The ID of the local user.
   * - userAccount: The user account of the local user.
   */
  on(evt: 'localUserRegistered', cb: (
    uid: number,
    userAccount: string
  ) => void): this;
  /** @zh-cn
   * 远端用户信息已更新回调。
   *
   * 远端用户加入频道后， SDK 会获取到该远端用户的 UID 和 User Account，然后缓存一个包含了远端用户 UID 和 User Account 的 Mapping 表，并在本地触发该回调。
   *
   * @param cb.uid 远端用户的 ID
   *
   * @param cb.userInfo 标识用户信息的 `UserInfo` 对象，包含用户 UID 和 User account
   */
  /** Occurs when the SDK gets the user ID and user account of the remote user.
   *
   * After a remote user joins the channel, the SDK gets the UID and user
   * account of the remote user, caches them in a mapping table
   * object (UserInfo), and triggers this callback on the local client.
   * - uid: The ID of the remote user.
   * - userInfo: The UserInfo Object that contains the user ID and user
   * account of the remote user.
   */
  on(
    evt: 'userInfoUpdated',
    cb: (uid: number, userInfo: UserInfo) => void
  ): this;
  /** @zh-cn
   * 本地视频状态发生改变回调。
   *
   * 本地视频的状态发生改变时，SDK 会触发该回调返回当前的本地视频状态；当状态码为 `3` 时，
   * 你可以在错误码查看返回的错误信息。 该接口在本地视频出现故障时，方便你了解当前视频的状态
   * 以及出现故障的原因。
   *
   *
   * @param cb.localVideoState 当前的本地视频状态码：
   *   - `0`：本地视频默认初始状态
   *   - `1`：本地视频采集设备启动成功。调用 {@link startScreenCaptureByWindow} 方法共享窗口且共享窗口为最大化时，也会报告该状态。
   *   - `2`：本地视频首帧编码成功
   *   - `3`：本地视频启动失败
   *
   * @param cb.error 本地视频错误码：
   *   - `0`：本地视频状态正常
   *   - `1`：出错原因不明确
   *   - `2`：没有权限启动本地视频采集设备
   *   - `3`：本地视频采集设备正在使用中
   *   - `4`：本地视频采集失败，建议检查采集设备是否正常工作
   *   - `5`：本地视频编码失败
   *   - `11`：调用 {@link startScreenCaptureByWindow} 方法共享窗口时，共享窗口处于最小化的状态。
   *   - `12`：该错误码表示通过窗口 ID 共享的窗口已关闭，或通过窗口 ID 共享的全屏窗口已退出全屏。
   * 退出全屏模式后，远端用户将无法看到共享的窗口。为避免远端用户看到黑屏，Agora 建议你立即结束本次共享。
   * 报告该错误码的常见场景：
   *     - 本地用户关闭共享的窗口时，SDK 会报告该错误码。
   *     - 本地用户先放映幻灯片，然后共享放映中的幻灯片。结束放映时，SDK 会报告该错误码。
   *     - 本地用户先全屏观看网页视频或网页文档，然后共享网页视频或网页文档。结束全屏时，SDK 会报告该错误码。
   */
  /**
   * Occurs when the local video state changes.
   *
   * This callback indicates the state of the local video stream, including
   * camera capturing and video encoding, and allows you to troubleshoot
   * issues when exceptions occur.
   *
   * The SDK triggers the
   * `LocalVideoStateChanged(LOCAL_VIDEO_STREAM_STATE_FAILED, LOCAL_VIDEO_STREAM_ERROR_CAPTURE_FAILURE)`
   * callback in the
   * following situations:
   * - The application exits to the background, and the system recycles
   * the camera.
   * - The camera starts normally, but the captured video is not output for
   * four seconds.
   *
   * When the camera outputs the captured video frames, if all the video
   * frames are the same for 15 consecutive frames, the SDK triggers the
   * `LocalVideoStateChanged(LOCAL_VIDEO_STREAM_STATE_CAPTURING, LOCAL_VIDEO_STREAM_ERROR_CAPTURE_FAILURE)`
   * callback. Note that the
   * video frame duplication detection is only available for video frames
   * with a resolution greater than 200 × 200, a frame rate greater than
   * or equal to 10 fps,
   * and a bitrate less than 20 Kbps.
   *
   * @note For some Windows device models, the SDK will not trigger this
   * callback when the state of the local video changes while the local video
   * capturing device is in use, so you have to make your own timeout judgment.
   *
   * @param cb.localVideoState The local video state.
   *
   * @param cb.err The detailed error information of the local video.
   */
  on(evt: 'localVideoStateChanged', cb: (
    localVideoState: LOCAL_VIDEO_STREAM_STATE,
    err: LOCAL_VIDEO_STREAM_ERROR
  ) => void): this;
  /** @zh-cn
   * 本地音频状态发生改变回调。
   *
   * 本地音频的状态发生改变时（包括本地麦克风录制状态和音频编码状态），SDK 会触发该回调报告
   * 当前的本地音频状态。在本地音频出现故障时，该回调可以帮助你了解当前音频的状态以及出现故障
   * 的原因，方便你排查问题。
   *
   *
   * @note 当状态码为 `3` 时，你可以在错误码中查看返回的错误信息。
   *
   *
   * @param cb.state 当前的本地音频状态：
   *  - `0` 本地音频默认初始状态。
   *  - `1` 本地音频录制设备启动成功。
   *  - `2` 本地音频首帧编码成功。
   *  - `3` 本地音频启动失败。
   *
   * @param cb.error 本地音频错误码：
   *  - `0` 本地音频状态正常。
   *  - `1` 本地音频出错原因不明确。
   *  - `2` 没有权限启动本地音频录制设备。
   *  - `3` 本地音频录制设备已经在使用中。
   *  - `4` 本地音频录制失败，建议你检查录制设备是否正常工作。
   *  - `5` 本地音频编码失败。
   */
  /**
   * Occurs when the local audio state changes.
   *
   * This callback indicates the state change of the local audio stream,
   * including the state of the audio recording and encoding, and allows you
   * to troubleshoot issues when exceptions occur.
   *
   * @param cb.state State of the local audio.
   * @param cb.err The error information of the local audio.
   */
  on(evt: 'localAudioStateChanged', cb: (
    state: LOCAL_AUDIO_STREAM_STATE,
    err: LOCAL_AUDIO_STREAM_ERROR
  ) => void): this;
  /** @zh-cn
   * 远端音频流状态发生改变回调。
   *
   * 远端用户/主播音频状态发生改变时，SDK 会触发该回调向本地用户报告当前的远端音频流状态。
   *
   * @param cb.uid 发生音频状态改变的远端用户 ID。
   *
   * @param cb.state 远端音频流状态码
   *
   * @param cb.reason 远端音频流状态改变的原因码
   *
   * @param cb.elapsed 从本地用户调用 {@link joinChannel} 方法到发生本事件经历的时间，
   * 单位为 ms。
   */
  /**
   * Occurs when the remote audio state changes.
   *
   * This callback indicates the state change of the remote audio stream.
   *
   * @param cb.uid ID of the remote user whose audio state changes.
   *
   * @param cb.state State of the remote audio:
   * {@link RemoteAudioState}.
   *
   * @param cb.reason The reason of the remote audio state change:
   * {@link RemoteAudioStateReason}.
   *
   * @param cb.elapsed Time elapsed (ms) from the local user calling the
   * {@link joinChannel} method until the SDK triggers this callback.
   */
  on(evt: 'remoteAudioStateChanged', cb: (
    uid: number,
    state: RemoteAudioState,
    reason: RemoteAudioStateReason,
    elapsed: number
  ) => void): this;
  /** @zh-cn
   * 跨频道媒体流转发状态发生改变回调。
   *
   * 当跨频道媒体流转发状态发生改变时，SDK 会触发该回调，并报告当前的转发状态以及相关的
   * 错误信息。
   *
   * @param cb.state 跨频道媒体流转发状态码
   *
   * @param cb.code 跨频道媒体流转发出错的错误码
   */
  /**
   * Occurs when the state of the media stream relay changes.
   *
   * The SDK reports the state of the current media relay and possible error
   * messages in this callback.
   *
   * @param cb.state The state code. See {@link ChannelMediaRelayState}.
   * @param cb.code The error code. See {@link ChannelMediaRelayError}.
   */
  on(evt: 'channelMediaRelayState', cb: (
    state: ChannelMediaRelayState,
    code: ChannelMediaRelayError
  ) => void): this;
  /** @zh-cn
   * 跨频道媒体流转发事件回调。
   *
   * 该回调报告跨频道媒体流转发过程中发生的事件。
   *
   * @param cb.event 跨频道媒体流转发事件码
   */
  /**
   * Reports events during the media stream relay.
   *
   * @param cb.event The event code. See {@link ChannelMediaRelayEvent}.
   */
  on(evt: 'channelMediaRelayEvent', cb: (
    event: ChannelMediaRelayEvent
  ) => void): this;
  /** @zh-cn
   * 媒体附属信息接收成功回调。
   *
   * 发送方调用 {@link sendMetadata} 方法发送媒体附属信息后，当接收方接收到该媒体附属信息
   * 时，SDK 触发本回调向接收方报告媒体附属信息。
   *
   * @param cb.metadata 媒体附属信息。
   */
  /** Receives the media metadata.
   *
   * After the sender sends the media metadata by calling the
   * {@link sendMetadata} method and the receiver receives the media metadata,
   * the SDK triggers this callback and reports the metadata to the receiver.
   *
   * @param cb.metadata The media metadata.
   */
  on(evt: 'receiveMetadata', cb: (
    metadata: Metadata
    ) => void): this;
  /** @zh-cn
   * 媒体附属信息发送成功回调。
   *
   * 发送方调用 {@link sendMetadata} 方法成功发送媒体附属信息后，SDK 触发本回调向发送方
   * 报告媒体附属信息。
   *
   * @param cb.metadata 媒体附属信息。
   */
  /** Sends the media metadata successfully.
   *
   * After the sender sends the media metadata successfully by calling the
   * {@link sendMetadata} method, the SDK triggers this calback to reports the
   * media metadata to the sender.
   *
   * @param cb.metadata The media metadata.
   */
  on(evt: 'sendMetadataSuccess', cb: (
    metadata: Metadata
    ) => void): this;
 /** @zh-cn
  * 已发布本地音频首帧回调。
  *
  * @since v3.2.0
  *
  * SDK 会在以下三种时机触发该回调：
  * - 开启本地音频的情况下，调用 {@link joinChannel} 成功加入频道后。
  * - 用 {@link muteLocalAudioStream muteLocalAudioStream(true)}，
  * 再调用 {@link muteLocalAudioStream muteLocalAudioStream(false)} 后。
  * - 调用 {@link disableAudio}，再调用 {@link enableAudio} 后。
  *
  * @param cb.elapsed 从调用 {@link joinChannel} 方法到触发该回调的时间间隔（毫秒）。
  */
 /** Occurs when the first audio frame is published.
  *
  * @since v3.2.0
  *
  * The SDK triggers this callback under one of the following circumstances:
  * - The local client enables the audio module and calls {@link joinChannel}
  * successfully.
  * - The local client calls
  * {@link muteLocalAudioStream muteLocalAudioStream(true)} and
  * {@link muteLocalAudioStream muteLocalAudioStream(false)} in sequence.
  * - The local client calls {@link disableAudio} and {@link enableAudio}
  * in sequence.
  *
  * @param cb.elapsed The time elapsed (ms) from the local client calling
  * {@link joinChannel} until the SDK triggers this callback.
  */
  on(evt: 'firstLocalAudioFramePublished', cb: (
    elapsed: number
  )=>void): this;
  /** @zh-cn
   * 已发布本地视频首帧回调。
   *
   * @since v3.2.0
   *
   * SDK 会在以下三种时机触发该回调：
   * - 开启本地视频的情况下，调用 {@link joinChannel} 成功加入频道后。
   * - 调用 {@link muteLocalVideoStream muteLocalVideoStream(true)}, 再调用
   * {@link muteLocalVideoStream muteLocalVideoStream(false)} 后。
   * - 调用 {@link disableVideo}，再调用 {@link enableVideo} 后。
   *
   * @param cb.elapsed 从调用 {@link joinChannel} 方法到触发该回调的时间间隔（毫秒）。
   */
  /** Occurs when the first video frame is published.
   *
   * @since v3.2.0
   *
   * The SDK triggers this callback under one of the following circumstances:
   * - The local client enables the video module and calls {@link joinChannel}
   * successfully.
   * - The local client calls
   * {@link muteLocalVideoStream muteLocalVideoStream(true)}and
   * {@link muteLocalVideoStream muteLocalVideoStream(false)} in sequence.
   * - The local client calls {@link disableVideo} and {@link enableVideo}
   * in sequence.
   *
   * @param cb.elapsed The time elapsed (ms) from the local client calling
   * {@link joinChannel} until the SDK triggers this callback.
   */
  on(evt: 'firstLocalVideoFramePublished', cb: (
    elapsed: number
  )=>void): this;
  /** @zh-cn
   * RTMP/RTMPS 推流事件回调。
   *
   * @since v3.2.0
   *
   * @param cb.url RTMP/RTMPS 推流 URL。
   * @param cb.eventCode RTMP/RTMPS 推流事件码。
   */
  /** Reports events during the RTMP or RTMPS streaming.
  *
  * @since v3.2.0
  *
  * @param cb.url The RTMP or RTMPS streaming URL.
  * @param cb.eventCode The event code.
  */
  on(evt: 'rtmpStreamingEvent', cb: (
    url: string,
    eventCode: RTMP_STREAMING_EVENT
  )=>void): this;
  /** @zh-cn
   * 音频发布状态改变回调。
   *
   * @since v3.2.0
   *
   * @param cb.channel 频道名。
   * @param cb.oldState 之前的发布状态。
   * @param cb.newState 当前的发布状态。
   * @param cb.elapseSinceLastState 两次状态变化时间间隔（毫秒）。
   */
  /** Occurs when the audio publishing state changes.
   *
   * @since v3.2.0
   *
   * This callback indicates the publishing state change of the local audio
   * stream.
   *
   * @param cb.channel The channel name.
   * @param cb.oldState The previous publishing state.
   * @param cb.newState The current publishing state.
   * @param cb.elapseSinceLastState The time elapsed (ms) from the previous state
   * to the current state.
   */
  on(evt: 'audioPublishStateChanged', cb: (
    channel: string,
    oldState: STREAM_PUBLISH_STATE,
    newState: STREAM_PUBLISH_STATE,
    elapseSinceLastState: number
  )=> void): this;
  /** @zh-cn
   * 视频发布状态改变回调。
   *
   * @since v3.2.0
   *
   * @param cb.channel 频道名。
   * @param cb.oldState 之前的发布状态。
   * @param cb.newState 当前的发布状态。
   * @param cb.elapseSinceLastState 两次状态变化时间间隔（毫秒）。
   */
  /** Occurs when the video publishing state changes.
   *
   * @since v3.2.0
   *
   * This callback indicates the publishing state change of the local video
   * stream.
   *
   * @param cb.channel The channel name.
   * @param cb.oldState The previous publishing state.
   * @param cb.newState The current publishing state.
   * @param cb.elapseSinceLastState The time elapsed (ms) from the previous state
   * to the current state.
   */
  on(evt: 'videoPublishStateChanged', cb: (
    channel: string,
    oldState: STREAM_PUBLISH_STATE,
    newState: STREAM_PUBLISH_STATE,
    elapseSinceLastState: number
  )=> void): this;
  /** @zh-cn
   * 音频订阅状态发生改变回调。
   *
   * @since v3.2.0
   *
   * @param cb.channel 频道名。
   * @param cb.uid 远端用户的 ID。
   * @param cb.oldState 之前的订阅状态。
   * @param cb.newState 当前的订阅状态。
   * @param cb.elapseSinceLastState 两次状态变化时间间隔（毫秒）。
   */
  /** Occurs when the audio subscribing state changes.
   *
   * @since v3.2.0
   *
   * This callback indicates the subscribing state change of a remote audio
   * stream.
   *
   * @param cb.channel The channel name.
   * @param cb.uid The ID of the remote user.
   * @param cb.oldState The previous subscribing state.
   * @param cb.newState The current subscribing state.
   * @param cb.elapseSinceLastState The time elapsed (ms) from the previous state
   * to the current state.
   */
  on(evt: 'audioSubscribeStateChanged', cb: (
    channel: string,
    uid: number,
    oldState: STREAM_SUBSCRIBE_STATE,
    newState: STREAM_SUBSCRIBE_STATE,
    elapseSinceLastState: number
  )=> void): this;
  /** @zh-cn
   * 视频订阅状态发生改变回调。
   *
   * @since v3.2.0
   *
   * @param cb.channel 频道名。
   * @param cb.uid 远端用户的 ID。
   * @param cb.oldState 之前的订阅状态。
   * @param cb.newState 当前的订阅状态。
   * @param cb.elapseSinceLastState 两次状态变化时间间隔（毫秒）。
   */
  /** Occurs when the audio subscribing state changes.
   *
   * @since v3.2.0
   *
   * This callback indicates the subscribing state change of a remote video
   * stream.
   *
   * @param cb.channel The channel name.
   * @param cb.uid The ID of the remote user.
   * @param cb.oldState The previous subscribing state.
   * @param cb.newState The current subscribing state.
   * @param cb.elapseSinceLastState The time elapsed (ms) from the previous state
   * to the current state.
   */
  on(evt: 'videoSubscribeStateChanged', cb: (
    channel: string,
    uid: number,
    oldState: STREAM_SUBSCRIBE_STATE,
    newState: STREAM_SUBSCRIBE_STATE,
    elapseSinceLastState: number
  )=> void): this;
  /**
   * Reserved callback.
   */
  on(evt: 'uploadLogResult', cb: (
    requestId: string,
    success: boolean,
    reason: number
  )=> void): this;

  on(evt: string, listener: Function): this;
}
/** @zh-cn
 * @since v3.0.0
 *
 * AgoraRtcChannel 类
 */
/**
 * @since v3.0.0
 *
 * The AgoraRtcChannel class.
 */
class AgoraRtcChannel extends EventEmitter
{
  rtcChannel: NodeRtcChannel;
  constructor(rtcChannel:NodeRtcChannel) {
    super();
    this.rtcChannel = rtcChannel;
    this.initEventHandler();
  }

  /**
   * init event handler
   * @private
   * @ignore
   */
  initEventHandler(): void {
    const fire = (event: string, ...args: Array<any>) => {
      setImmediate(() => {
        this.emit(event, ...args);
      });
    };

    this.rtcChannel.onEvent('apierror', (funcName: string) => {
      console.error(`api ${funcName} failed. this is an error
              thrown by c++ addon layer. it often means sth is
              going wrong with this function call and it refused
              to do what is asked. kindly check your parameter types
              to see if it matches properly.`);
    });

    this.rtcChannel.onEvent('joinChannelSuccess', (
      uid: number,
      elapsed: number
    ) => {
      fire('joinChannelSuccess', uid, elapsed);
    });

    this.rtcChannel.onEvent('channelWarning', (
      warn: number,
      message: string
    ) => {
      fire('channelWarning', warn, message);
    });

    this.rtcChannel.onEvent('channelError', (
      error: number,
      message: string
    ) => {
      fire('channelError', error, message);
    });


    this.rtcChannel.onEvent('rejoinChannelSuccess', (
      uid: number,
      elapsed: number
    ) => {
      fire('rejoinChannelSuccess', uid, elapsed);
    });


    this.rtcChannel.onEvent('leaveChannel', (
      stats: RtcStats
    ) => {
      fire('leaveChannel', stats);
    });

    this.rtcChannel.onEvent('clientRoleChanged', (
      oldRole: number,
      newRole: number
    ) => {
      fire('clientRoleChanged', oldRole, newRole);
    });

    this.rtcChannel.onEvent('userJoined', (
      uid: number,
      elapsed: number
    ) => {
      fire('userJoined', uid, elapsed);
    });

    this.rtcChannel.onEvent('userOffline', (
      uid: number,
      reason: number
    ) => {
      fire('userOffline', uid, reason);
    });

    this.rtcChannel.onEvent('connectionLost', (
    ) => {
      fire('connectionLost');
    });

    this.rtcChannel.onEvent('requestToken', (
    ) => {
      fire('requestToken');
    });

    this.rtcChannel.onEvent('tokenPrivilegeWillExpire', (
      token: string
    ) => {
      fire('tokenPrivilegeWillExpire', token);
    });

    this.rtcChannel.onEvent('rtcStats', (
      stats: RtcStats
    ) => {
      fire('rtcStats', stats);
    });

    this.rtcChannel.onEvent('networkQuality', (
      uid: number,
      txQuality: number,
      rxQuality: number
    ) => {
      fire('networkQuality', uid, txQuality, rxQuality);
    });

    this.rtcChannel.onEvent('remoteVideoStats', (
      stats: RemoteVideoStats
    ) => {
      fire('remoteVideoStats', stats);
    });

    this.rtcChannel.onEvent('remoteAudioStats', (
      stats: RemoteAudioStats
    ) => {
      fire('remoteAudioStats', stats);
    });

    this.rtcChannel.onEvent('remoteAudioStateChanged', (
      uid: number,
      state: RemoteAudioState,
      reason: RemoteAudioStateReason,
      elapsed: number
    ) => {
      fire('remoteAudioStateChanged', uid, state, reason, elapsed);
    });

    this.rtcChannel.onEvent('activeSpeaker', (
      uid: number
    ) => {
      fire('activeSpeaker', uid);
    });

    this.rtcChannel.onEvent('firstRemoteVideoFrame', (
      uid: number,
      width: number,
      height: number,
      elapsed: number
    ) => {
      fire('firstRemoteVideoFrame', uid, width, height, elapsed);
    });

    this.rtcChannel.onEvent('firstRemoteAudioDecoded', (
      uid: number,
      elapsed: number
    ) => {
      fire('firstRemoteAudioDecoded', uid, elapsed);
    });

    this.rtcChannel.onEvent('videoSizeChanged', (
      uid: number,
      width: number,
      height: number,
      rotation: number
    ) => {
      fire('videoSizeChanged', uid, width, height, rotation);
    });

    this.rtcChannel.onEvent('remoteVideoStateChanged', (
      uid: number,
      state: number,
      reason: number,
      elapsed: number
    ) => {
      fire('remoteVideoStateChanged', uid, state, reason, elapsed);
    });

    this.rtcChannel.onEvent('streamMessage', (
      uid: number,
      streamId: number,
      data: string
    ) => {
      fire('streamMessage', uid, streamId, data);
    });

    this.rtcChannel.onEvent('streamMessageError', (
      uid: number,
      streamId: number,
      code: number,
      missed: number,
      cached: number
    ) => {
      fire('streamMessage', uid, streamId, code, missed, cached);
    });

    this.rtcChannel.onEvent('channelMediaRelayStateChanged', (
      state: number,
      code: number
    ) => {
      fire('channelMediaRelayStateChanged', state, code);
    });

    this.rtcChannel.onEvent('channelMediaRelayEvent', (
      code: number
    ) => {
      fire('channelMediaRelayEvent', code);
    });

    this.rtcChannel.onEvent('firstRemoteAudioFrame', (
      uid: number,
      elapsed: number
    ) => {
      fire('firstRemoteAudioFrame', uid, elapsed);
    });

    this.rtcChannel.onEvent('rtmpStreamingStateChanged', (
      url: string,
      state: number,
      errCode: number
    ) => {
      fire('rtmpStreamingStateChanged', url, state, errCode);
    });

    this.rtcChannel.onEvent('transcodingUpdated', (
    ) => {
      fire('transcodingUpdated');
    });

    this.rtcChannel.onEvent('streamInjectedStatus', (
      url: string,
      uid: number,
      status: number
    ) => {
        fire('streamInjectedStatus', url, uid, status);
    });

    this.rtcChannel.onEvent('remoteSubscribeFallbackToAudioOnly', (
      uid: number,
      isFallbackOrRecover: boolean
    ) => {
        fire('remoteSubscribeFallbackToAudioOnly', uid, isFallbackOrRecover);
    });

    this.rtcChannel.onEvent('connectionStateChanged', (
      state: number,
      reason: number
    ) => {
        fire('connectionStateChanged', state, reason);
    });

    this.rtcChannel.onEvent('audioPublishStateChanged', function(oldState: STREAM_PUBLISH_STATE, newState: STREAM_PUBLISH_STATE, elapseSinceLastState: number) {
      fire('audioPublishStateChanged', oldState, newState, elapseSinceLastState);
    })

    this.rtcChannel.onEvent('videoPublishStateChanged', function(oldState: STREAM_PUBLISH_STATE, newState: STREAM_PUBLISH_STATE, elapseSinceLastState: number) {
      fire('videoPublishStateChanged', oldState, newState, elapseSinceLastState);
    })

    this.rtcChannel.onEvent('audioSubscribeStateChanged', function(uid: number, oldState: STREAM_SUBSCRIBE_STATE, newState: STREAM_SUBSCRIBE_STATE, elapseSinceLastState: number) {
      fire('audioSubscribeStateChanged', uid, oldState, newState, elapseSinceLastState);
    })

    this.rtcChannel.onEvent('videoSubscribeStateChanged', function(uid: number, oldState: STREAM_SUBSCRIBE_STATE, newState: STREAM_SUBSCRIBE_STATE, elapseSinceLastState: number) {
      fire('videoSubscribeStateChanged', uid, oldState, newState, elapseSinceLastState);
    })
  }
  /** @zh-cn
   * 通过 UID 加入频道。
   *
   * {@link AgoraRtcChannel.joinChannel} 与 {@link AgoraRtcEngine.joinChannel}
   * 方法有以下区别：
   * - {@link AgoraRtcChannel.joinChannel}:
   *  - 无 `channel` 参数。因为创建 `AgoraRtcChannel` 对象时已指定了 `channel`。
   *  - 加了 `options` 参数，可在加入频道前通过该参数设置是否订阅该频道的音视频流。
   *  - 通过创建多个 `AgoraRtcChannel` 对象，并调用相应对象的 `joinChannel` 方法实现同
   * 时加入多个频道。
   *  - 过该方法加入频道后，SDK 默认不发布本地音视频流到本频道，用户需要调用 {@link publish} 方法发布。
   * - {@link AgoraRtcEngine.joinChannel}:
   *  - 需要填入可以标识频道的 `channelId`。
   *  - 无 `options` 参数。加入频道即默认订阅频道内的音视频流。
   *  - 只允许加入一个频道。
   *  - 通过该方法加入频道后，SDK 默认发布音视频流发布到本频道。
   *
   * @note
   * - 该方法不支持相同的用户重复加入同一个频道。
   * - 我们建议不同频道中使用不同的 UID。
   * - 如果想要从不同的设备同时接入同一个频道，请确保每个设备上使用的 UID 是不同的。
   * - 请确保用于生成 Token 的 App ID 和创建 IChannel 对象时用的 App ID 一致。
   * @param token 在 App 服务器端生成的用于鉴权的 Token：
   * - 安全要求不高：你可以使用控制台生成的临时 Token，详见 [获取临时 Token](https://docs.agora.io/cn/Agora%20Platform/token?platform=All%20Platforms#获取临时-token).
   * - 安全要求高：将值设为你的服务端生成的正式 Token，详见 [获取正式 Token](https://docs.agora.io/cn/Agora%20Platform/token?platform=All%20Platforms#获取正式-token).
   * @param info （非必选项）开发者需加入的任何附加信息。一般可设置为空字符串，或频道相关信息。该信息不会传递给频道内的其他用户。
   * @param uid 用户 ID，32 位无符号整数。建议设置范围：1 到 2<sup>32</sup>-1，并保证唯一性。如果不指定（即设为 0），SDK 会自动分配一个，
   * 并在 joinChannelSuccess` 回调中返回，App 层必须记住该返回值并维护，SDK 不对该返回值进行维护。
   * @param options 频道媒体设置选项，详见 {@link ChannelMediaOptions}
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   *  - 错误码 `2`，`3`，`5`
   */
  /** Joins a channel with the user ID, and configures whether to
   * automatically subscribe to the audio or video streams.
   *
   * @since v3.3.1
   *
   * Users in the same channel can talk to each other, and multiple users in
   * the same channel can start a group chat. Users with different App IDs
   * cannot call each other.
   *
   * You must call the {@link leaveChannel} method to exit the current call
   * before entering another channel.
   *
   * A successful `joinChannel` method call triggers the following callbacks:
   * - The local client: `joinChannelSuccess`.
   * - The remote client: `userJoined`, if the user joining the channel is
   * in the `0` (communication) profile, or is a host in the `1` (live stream
   * ing) profile.
   *
   * When the connection between the client and the Agora server is
   * interrupted due to poor network conditions, the SDK tries reconnecting
   * to the server.
   *
   * When the local client successfully rejoins the channel, the SDK triggers
   * the `rejoinChannelSuccess` callback on the local client.
   *
   * @note Ensure that the App ID used for generating the token is the same
   * App ID used in the {@link initialize} method for creating an
   * `AgoraRtcEngine` object.
   *
   * @param token The token generated at your server. For details,
   * see [Generate a token](https://docs.agora.io/en/Interactive%20Broadcast/token_server?platform=Electron).
   * @param channelId The unique channel name for the Agora RTC session in
   * the string format smaller than 64 bytes. Supported characters:
   * - All lowercase English letters: a to z.
   * - All uppercase English letters: A to Z.
   * - All numeric characters: 0 to 9.
   * - The space character.
   * - Punctuation characters and other symbols, including:
   * "!", "#", "$", "%", "&", "(", ")", "+", "-", ":", ";", "<", "=", ".",
   * ">", "?", "@", "[", "]", "^", "_", " {", "}", "|", "~", ",".
   * @param info (Optional) Reserved for future use.
   * @param uid (Optional) User ID. A 32-bit unsigned integer with a value
   * ranging from 1 to 2<sup>32</sup>-1. The @p uid must be unique. If
   * a @p uid is not assigned (or set to 0), the SDK assigns and returns
   * a @p uid in the `joinChannelSuccess` callback.
   * Your application must record and maintain the returned `uid`, because the
   * SDK does not do so. **Note**: The ID of each user in the channel should
   * be unique.
   * If you want to join the same channel from different devices, ensure that
   * the user IDs in all devices are different.
   * @param options The channel media options. See {@link ChannelMediaOptions}.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   *    - `-2`: The parameter is invalid.
   *    - `-3`: The SDK fails to be initialized. You can try
   * re-initializing the SDK.
   *    - `-5: The request is rejected. This may be caused by the
   * following:
   *        - You have created an `AgoraRtcChannel` object with the same
   * channel name.
   *        - You have joined and published a stream in a channel created by
   * the `AgoraRtcChannel` object. When you join a channel created by the
   * `AgoraRtcEngine` object, the SDK publishes the local audio and video
   * streams to that channel by default. Because the SDK does not support
   * publishing a local stream to more than one channel simultaneously, an
   * error occurs in this occasion.
   *    - `-7`: The SDK is not initialized before calling
   * this method.
   */
  joinChannel(
    token: string,
    info: string,
    uid: number,
    options: ChannelMediaOptions
  ): number {
    return this.rtcChannel.joinChannel(token, info, uid, options || {
      autoSubscribeAudio: true,
      autoSubscribeVideo: true
    });
  }
  /** @zh-cn
   * 使用 User Account 加入频道。
   *
   * 该方法允许本地用户使用 User Account 加入频道。成功加入频道后，会触发以下回调：
   * - 本地：`localUserRegistered` 和 `userInfoUpdated`
   * - 远端：通信场景下的用户和直播场景下的主播加入频道后，远端会依次触发 `userJoined` 和 `userInfoUpdated` 回调
   *
   * @note 为保证通信质量，请确保频道内使用同一类型的数据标识用户身份。即同一频道内需要统一使用 UID 或 User Account。如果有用户通过 Agora Web SDK 加入频道，请确保 Web 加入的用户也是同样类型。
   *
   * @param token 在 App 服务器端生成的用于鉴权的 Token：
   * - 安全要求不高：你可以使用 Console 生成的临时 Token，详见[获取临时 Token](https://docs.agora.io/cn/Video/token?platform=All%20Platforms#获取临时-token)
   * - 安全要求高：将值设为你的服务端生成的正式 Token，详见[获取正式 Token](https://docs.agora.io/cn/Video/token?platform=All%20Platforms#获取正式-token)
   * @param userAccount 用户 User Account。该参数为必须，最大不超过 255 字节，不可为 NULL。请确保加入频道的 User Account 的唯一性。
   * - 26 个小写英文字母 a-z
   * - 26 个大写英文字母 A-Z
   * - 10 个数字 0-9
   * - 空格
   * - "!", "#", "$", "%", "&", "(", ")", "+", "-", ":", ";", "<", "=", ".", ">", "?", "@", "[", "]", "^", "_", " {", "}", "|", "~", ","
   * @param options 频道媒体设置选项，详见 {@link ChannelMediaOptions}
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   *  - 错误码 `2`，`3`，`5`
   */
  /**
   * Joins the channel with a user account.
   *
   * After the user successfully joins the channel, the SDK triggers the
   * following callbacks:
   * - The local client: `localUserRegistered` and `joinChannelSuccess`.
   * - The remote client: `userJoined` and `userInfoUpdated`, if the user
   * joining the channel is in the communication(`0`) profile, or is a host
   * in the `1` (live streaming) profile.
   *
   * @note To ensure smooth communication, use the same parameter type to
   * identify the user. For example, if a user joins the channel with a user
   * ID, then ensure all the other users use the user ID too. The same applies
   * to the user account. If a user joins the channel with the Agora Web SDK,
   * ensure that the uid of the user is set to the same parameter type.
   * @param token The token generated at your server. For details,
   * see [Generate a token](https://docs.agora.io/en/Interactive%20Broadcast/token_server?platform=Electron).
   * @param userAccount The user account. The maximum length of this parameter
   * is 255 bytes. Ensure that you set this parameter and do not set it as
   * null. Supported character scopes are:
   * - All lowercase English letters: a to z.
   * - All uppercase English letters: A to Z.
   * - All numeric characters: 0 to 9.
   * - The space character.
   * - Punctuation characters and other symbols, including: "!", "#", "$",
   * "%", "&", "(", ")", "+", "-", ":", ";", "<", "=", ".", ">", "?", "@",
   * "[", "]", "^", "_", " {", "}", "|", "~", ",".
   * @param options The channel media options. See
   * {@link ChannelMediaOptions}.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   *  - `-2`
   *  - `-3`
   *  - `-5`
   *  - `-7`
   */
  joinChannelWithUserAccount(
    token: string,
    userAccount: string,
    options: ChannelMediaOptions
  ): number {
    return this.rtcChannel.joinChannelWithUserAccount(token, userAccount, options || {
      autoSubscribeAudio: true,
      autoSubscribeVideo: true
    });
  }
  /** @zh-cn
   * 获取当前频道的频道名。
   *
   * @return
   * - 方法调用成功，返回 `AgoraRtcChannel`
   * - 方法调用失败，返回空字符串
   */
  /**
   * Gets the channel ID of the current `AgoraRtcChannel` object.
   *
   * @return
   * - The channel ID of the current `AgoraRtcChannel` object, if the method
   * call succeeds.
   * - The empty string "", if the method call fails.
   */
  channelId(): string {
    return this.rtcChannel.channelId()
  }
  /** @zh-cn
   * 获取通话 ID。
   *
   * 客户端在每次 {@link joinChannel} 后会生成一个对应的 `CallId`，标识该客户端的此次通话。
   * 有些方法如 {@link rate}, {@link complain} 需要在通话结束后调用，向 SDK 提交反馈，这些方法必须指定 `CallId` 参数。
   * 使用这些反馈方法，需要在通话过程中调用 `getCallId` 方法获取 `CallId`，在通话结束后在反馈方法中作为参数传入。
   * @returns {string} 通话 ID
   */
  /**
   * Retrieves the current call ID.
   *
   * When a user joins a channel on a client, a `callId` is generated to
   * identify the call from the client. Feedback methods, such as
   * {@link AgoraRtcChannel.rate rate} and
   * {@link AgoraRtcChannel.complain complain}, must be called after the call
   * ends to submit feedback to the SDK.
   *
   * The `rate` and `complain` methods require the `callId` parameter retrieved
   * from the `getCallId` method during a call.
   *
   * @return
   * - The call ID, if the method call succeeds.
   * - The empty string "", if the method call fails.
   */
  getCallId(): string {
    return this.rtcChannel.getCallId()
  }
  /** @zh-cn
   * 设置直播场景下的用户角色。
   *
   * 加入频道前，用户需要通过本方法设置观众或主播模式。
   *
   * 加入频道后，用户可以通过本方法切换用户模式。直播场景下，如果你在加入频道后调用该方法切换用户角色，
   * 调用成功后，本地会触发 `clientRoleChanged` 事件；远端会触发 `userJoined` 事件。
   *
   * @param {ClientRoleType} role 用户角色：
   * - 1：主播
   * - 2：（默认）观众
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Sets the role of the user.
   *
   * - This method can be used to set the user's role before the user joins a
   * channel in a live streaming.
   * - This method can be used to switch the user role in a live streaming after
   * the user joins a channel.
   *
   * In the `1` (live streaming) profile, when a user calls this method to switch
   * user roles after joining a channel, SDK triggers the follwoing callbacks:
   * - The local client: `clientRoleChanged` in the `AgoraRtcChannel`
   * interface.
   * - The remote clinet: `userjoined` or `userOffline`.
   *
   * @note This method applies only to the `1` (live streaming) profile.
   * @param role Sets the role of the user. See
   * {@link AgoraRtcChannel.role role}
   *
   * @return
   * - 0: Success
   * - < 0: Failure
   */
  setClientRole(role: ClientRoleType): number {
    return this.rtcChannel.setClientRole(role);
  }
  /** @zh-cn
   * 设置直播场景下的用户角色和观众端延时级别。
   *
   * @since v3.2.0
   *
   * 在加入频道前和加入频道后均可调用该方法设置用户角色。
   *
   * 如果你在加入频道后调用该方法成功切换用户角色，SDK 会触发以下回调：
   * - 本地触发 `clientRoleChanged` 回调。
   * - 远端触发 `userJoined` 或 `userOffline` 回调。
   *
   * @note
   * - 该方法仅在频道场景为直播时生效。
   * - 该方法与 {@link setClientRole} 的区别在于，该方法还支持设置用户级别。
   *  - 用户角色确定用户在 SDK 层的权限，包含是否可以发送流、是否可以接收流、是否可以推流到 CDN 等。
   *  - 用户级别需要与角色结合使用，确定用户在其权限范围内，可以操作和享受到的服务级别。
   * 例如对于观众，选择接收低延时还是超低延时的视频流。不同的级别会影响计费。
   *
   * @param role 直播场景中的用户角色。
   * @param options 用户具体设置，包含用户级别。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /** Sets the role of a user in interactive live streaming.
   *
   * @since v3.2.0
   *
   * You can call this method either before or after joining the channel to
   * set the user role as audience or host. If
   * you call this method to switch the user role after joining the channel,
   * the SDK triggers the following callbacks:
   * - The local client: `clientRoleChanged`.
   * - The remote client: `userJoined` or `userOffline`.
   *
   * @note
   * - This method applies to the `LIVE_BROADCASTING` profile only.
   * - The difference between this method and {@link setClientRole} is that
   * this method can set the user level in addition to the user role.
   *  - The user role determines the permissions that the SDK grants to a
   * user, such as permission to send local
   * streams, receive remote streams, and push streams to a CDN address.
   *  - The user level determines the level of services that a user can
   * enjoy within the permissions of the user's
   * role. For example, an audience can choose to receive remote streams with
   * low latency or ultra low latency. Levels
   * affect prices.
   *
   * @param role The role of a user in interactive live streaming.
   * @param options The detailed options of a user, including user level.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setClientRoleWithOptions(role: ClientRoleType, options: ClientRoleOptions): number {
    return this.rtcChannel.setClientRoleWithOptions(role, options);
  }
  /**
   * Prioritizes a remote user's stream.
   *
   * Use this method with the
   * {@link setRemoteSubscribeFallbackOption} method.
   *
   * If the fallback function is enabled for a subscribed stream, the SDK
   * ensures the high-priority user gets the best possible stream quality.
   *
   * @note The Agora SDK supports setting `serPriority` as high for one user
   * only.
   * @param uid The ID of the remote user.
   * @param priority The priority of the remote user. See
   * {@link Priority}.
   *
   * @return
   * - 0: Success
   * - < 0: Failure
   */
  setRemoteUserPriority(uid: number, priority: Priority) {
    return this.rtcChannel.setRemoteUserPriority(uid, priority);
  }
  /** @zh-cn
   * 更新 Token。
   *
   * 如果启用了 Token 机制，过一段时间后使用的 Token 会失效。当报告错误码 `109`或 `tokenPrivilegeWillExpire` 回调时，
   * 你应重新获取 Token，然后调用该 API 更新 Token，否则 SDK 无法和服务器建立连接。
   *
   * @param {string} newtoken 新的 Token
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Gets a new token when the current token expires after a period of time.
   *
   * The `token` expires after a period of time once the token schema is
   * enabled when the SDK triggers the `onTokenPrivilegeWillExpire` callback or
   * `CONNECTION_CHANGED_TOKEN_EXPIRED(9)` of `onConnectionStateChanged`
   * callback.
   *
   * You should call this method to renew `token`, or the SDK disconnects from
   * Agora' server.
   *
   * @param newtoken The new Token.
   *
   * @return
   * - 0: Success
   * - < 0: Failure
   */
  renewToken(newtoken: string): number {
    return this.rtcChannel.renewToken(newtoken);
  }
  /** @zh-cn
   * @deprecated 该方法自 v3.2.0 起废弃。请改用 {@link enableEncryption} 方法。
   *
   * 启用内置加密，并设置数据加密密码。
   *
   * 如需启用加密，请在 {@link joinChannel} 前调用该方法，并设置加密的密码。
   * 同一频道内的所有用户应设置相同的密码。当用户离开频道时，该频道的密码会自动清除。如果未指定密码或将密码设置为空，则无法激活加密功能。
   *
   * @note 为保证最佳传输效果，请确保加密后的数据大小不超过原始数据大小 + 16 字节。16 字节是 AES 通用加密模式下最大填充块大小。
   *
   * @param {string} secret 加密密码
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * @deprecated This method is deprecated from v3.2.0. Use the
   * {@link enableEncryption} method instead.
   *
   * Enables built-in encryption with an encryption password before users
   * join a channel.
   *
   * All users in a channel must use the same encryption password. The
   * encryption password is automatically cleared once a user leaves the
   * channel. If an encryption password is not specified, the encryption
   * functionality will be disabled.
   *
   * @note
   * - Do not use this method for the CDN live streaming function.
   * - For optimal transmission, ensure that the encrypted data size does not
   * exceed the original data size + 16 bytes. 16 bytes is the maximum padding
   * size for AES encryption.
   *
   * @param secret The encryption password.
   *
   * @return
   * - 0: Success
   * - < 0: Failure
   */
  setEncryptionSecret(secret: string): number {
    return this.rtcChannel.setEncryptionSecret(secret);
  }
  /** @zh-cn
   * 设置内置的加密方案。
   *
   * @deprecated 该方法自 v3.2.0 废弃，请改用 {@link enableEncryption}。
   * Agora Native SDK 支持内置加密功能，默认使用 AES-128-XTS 加密方式。如需使用其他加密方式，可以调用该 API 设置。
   *
   * 同一频道内的所有用户必须设置相同的加密方式和密码才能进行通话。关于这几种加密方式的区别，请参考 AES 加密算法的相关资料。
   *
   * @note 调用本方法前，请先调用 {@link setEncryptionSecret} 方法启用内置加密功能。
   *
   * @param mode 加密方式。目前支持以下几种：
   * - "aes-128-xts"：128 位 AES 加密，XTS 模式
   * - "aes-128-ecb"：128 位 AES 加密，ECB 模式
   * - "aes-256-xts"：256 位 AES 加密，XTS 模式
   * - ""：设置为空字符串时，默认使用加密方式 aes-128-xts
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Sets the built-in encryption mode.
   *
   * @depercated This method is deprecated from v3.2.0. Use
   * the {@link enableEncryption} method instead.
   *
   * The Agora SDK supports built-in encryption, which is set to the
   * `aes-128-xts` mode by default. To use other encryption modes, call this
   * method.
   *
   * All users in the same channel must use the same encryption mode and
   * password.
   *
   * Refer to the information related to the AES encryption algorithm on the
   * differences between the encryption modes.
   *
   * @note Call the {@link setEncryptionSecret} method before calling this
   * method.
   *
   * @param mode The set encryption mode:
   * - "aes-128-xts": (Default) 128-bit AES encryption, XTS mode.
   * - "aes-128-ecb": 128-bit AES encryption, ECB mode.
   * - "aes-256-xts": 256-bit AES encryption, XTS mode.
   * - "": When encryptionMode is set as NULL, the encryption mode is set as
   * "aes-128-xts" by default.
   *
   * @return
   * - 0: Success
   * - < 0: Failure
   */
  setEncryptionMode(mode: string): number {
    return this.rtcChannel.setEncryptionMode(mode);
  }
  /** @zh-cn
   * 设置远端用户声音的空间位置和音量，方便本地用户听声辨位。
   *
   * 用户通过调用该接口，设置远端用户声音出现的位置，左右声道的声音差异会让用户产生声音的方位感，从而判断出远端用户的实时位置。
   * 在多人在线游戏场景，如吃鸡游戏中，该方法能有效增加游戏角色的方位感，模拟真实场景。
   *
   * @note
   * - 使用该方法需要在加入频道前调用 {@link enableSoundPositionIndication} 开启远端用户的语音立体声
   * - 为获得最佳听觉体验，我们建议用户佩戴耳机
   * @param {number} uid 远端用户的 ID
   * @param {number} pan 设置远端用户声音出现的位置，取值范围为 [-1.0, 1.0]：
   * - 0.0：（默认）声音出现在正前方
   * - -1.0：声音出现在左边
   * - 1.0：声音出现在右边
   * @param {number} gain 设置远端用户声音的音量，取值范围为 [0.0, 100.0]，默认值为 100.0，表示该用户的原始音量。取值越小，则音量越低
   * @returns {number}
   * - 0：方法调用成功
   * - -1：方法调用失败
   */
  /**
   * Sets the sound position and gain of a remote user.
   *
   * When the local user calls this method to set the sound position of a
   * remote user, the sound difference between the left and right channels
   * allows the local user to track the real-time position of the remote user,
   * creating a real sense of space. This method applies to massively
   * multiplayer online games, such as Battle Royale games.
   *
   * @note
   * - For this method to work, enable stereo panning for remote users by
   * calling the {@link enableSoundPositionIndication} method before joining a
   * channel.
   * - This method requires hardware support. For the best sound positioning,
   * we recommend using a stereo speaker.
   * @param uid The ID of the remote user.
   * @param pan The sound position of the remote user. The value ranges from
   * -1.0 to 1.0:
   * - 0.0: The remote sound comes from the front.
   * - -1.0: The remote sound comes from the left.
   * - 1.0: The remote sound comes from the right.
   * @param gain Gain of the remote user. The value ranges from 0.0 to 100.0.
   * The default value is 100.0 (the original gain of the remote user). The
   * smaller the value, the less the gain.
   *
   * @return
   * - 0: Success
   * - < 0: Failure
   */
  setRemoteVoicePosition(uid: number, pan: number, gain: number): number {
    return this.rtcChannel.setRemoteVoicePosition(uid, pan, gain);
  }
  /** @zh-cn
   * 设置是否默认接收音频流。
   *
   * 该方法在加入频道前后都可调用。如果在加入频道后调用 `setDefaultMuteAllRemoteAudioStreams (true)`，会接收不到后面加入频道的用户的音频流。
   *
   * @note 停止接收音频流后，如果想要恢复接收，请调用 {@link muteRemoteAudioStream}(false)，并指定你想要接收的远端用户 uid；
   * 如果想恢复接收多个用户的音频流，则需要多次调用 {@link muteRemoteAudioStream}(false)。`setDefaultMuteAllRemoteAudioStreams (false)` 只能恢复接收后面加入频道的用户的音频流。
   * @param {boolean} mute
   * - true：默认不接收所有音频流
   * - false：默认接收所有音频流（默认）
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /** Stops or resumes subscribing to the audio streams of all remote users
   * by default.
   *
   * @deprecated This method is deprecated from v3.3.1.
   *
   *
   * Call this method after joining a channel. After successfully calling this
   * method, the
   * local user stops or resumes subscribing to the audio streams of all
   * subsequent users.
   *
   * @note If you need to resume subscribing to the audio streams of remote
   * users in the
   * channel after calling {@link setDefaultMuteAllRemoteAudioStreams}(true),
   * do the following:
   * - If you need to resume subscribing to the audio stream of a specified
   * user, call {@link muteRemoteAudioStream}(false), and specify the user ID.
   * - If you need to resume subscribing to the audio streams of multiple
   * remote users, call {@link muteRemoteAudioStream}(false) multiple times.
   *
   * @param mute Sets whether to stop subscribing to the audio streams of all
   * remote users by default.
   * - true: Stop subscribing to the audio streams of all remote users by
   * default.
   * - false: (Default) Resume subscribing to the audio streams of all remote
   * users by default.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setDefaultMuteAllRemoteAudioStreams(mute: boolean): number {
    return this.rtcChannel.setDefaultMuteAllRemoteAudioStreams(mute);
  }
  /** @zh-cn
   * 设置是否默认接收视频流。
   *
   * 该方法在加入频道前后都可调用。如果在加入频道后调用 `setDefaultMuteAllRemoteVideoStreams (true)`，会接收不到设置后加入频道的用户的视频流。
   *
   * @note 停止接收视频流后，如果想要恢复接收，请调用 {@link muteRemoteVideoStream}(false)，
   * 并指定你想要接收的远端用户 uid；如果想恢复接收多个用户的视频流，则需要多次调用 {@link muteRemoteVideoStream}(false)。
   * `setDefaultMuteAllRemoteVideoStreams (false)` 只能恢复接收后面加入频道的用户的视频流。
   * @param {boolean} mute
   * - true：默认不接收任何视频流
   * - false：默认继续接收所有视频流（默认）
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /** Stops or resumes subscribing to the video streams of all remote users
   * by default.
   *
   * @deprecated This method is deprecated from v3.3.1.
   *
   * Call this method after joining a channel. After successfully calling
   * this method, the
   * local user stops or resumes subscribing to the video streams of all
   * subsequent users.
   *
   * @note If you need to resume subscribing to the video streams of remote
   * users in the
   * channel after calling {@link setDefaultMuteAllRemoteVideoStreams}(true),
   * do the following:
   * - If you need to resume subscribing to the video stream of a specified
   * user, call {@link muteRemoteVideoStream}(false), and specify the user ID.
   * - If you need to resume subscribing to the video streams of multiple
   * remote users, call {@link muteRemoteVideoStream}(false) multiple times.
   *
   * @param mute Sets whether to stop subscribing to the video streams of all
   * remote users by default.
   * - true: Stop subscribing to the video streams of all remote users by
   * default.
   * - false: (Default) Resume subscribing to the video streams of all remote
   * users by default.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setDefaultMuteAllRemoteVideoStreams(mute: boolean): number {
    return this.rtcChannel.setDefaultMuteAllRemoteVideoStreams(mute);
  }
  /** @zh-cn
   * 接收／停止接收所有音频流。
   *
   *
   * @param mute
   * - true: 停止接收所有音频流；
   * - false: 继续接收所有音频流（默认）。
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Stops or resumes subscribing to the audio streams of all remote users.
   *
   * As of v3.3.1, after successfully calling this method, the local user
   * stops or resumes
   * subscribing to the audio streams of all remote users, including all
   * subsequent users.
   *
   * @note
   * - Call this method after joining a channel.
   * - See recommended settings in *Set the Subscribing State*.
   *
   * @param mute Sets whether to stop subscribing to the audio streams of
   * all remote users.
   * - true: Stop subscribing to the audio streams of all remote users.
   * - false: (Default) Resume subscribing to the audio streams of all
   * remote users.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  muteAllRemoteAudioStreams(mute: boolean): number {
    return this.rtcChannel.muteAllRemoteAudioStreams(mute);
  }
  /** @zh-cn
   * 停止/恢复接收指定音频流。
   *
   * 如果之前有调用过 {@link muteAllRemoteAudioStreams}(true) 停止订阅所有远端
   * 音频，在调用 `muteRemoteAudioStreams` 之前请确保你已调用 {@link muteAllRemoteAudioStreams}(false)。
   *
   * `muteAllRemoteAudioStreams` 是全局控制，`muteRemoteAudioStream` 是精细控制。
   *
   * @param {number} uid 指定的用户 ID
   * @param {boolean} mute
   * - `true`：停止接收指定用户的音频流
   * - `false`：继续接收指定用户的音频流
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Stops or resumes subscribing to the audio stream of a specified user.
   *
   * @note
   * - Call this method after joining a channel.
   * - See recommended settings in *Set the Subscribing State*.
   *
   * @param userId The user ID of the specified remote user.
   * @param mute Sets whether to stop subscribing to the audio stream of a
   * specified user.
   * - true: Stop subscribing to the audio stream of a specified user.
   * - false: (Default) Resume subscribing to the audio stream of a specified
   * user.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  muteRemoteAudioStream(uid: number, mute: boolean): number {
    return this.rtcChannel.muteRemoteAudioStream(uid, mute);
  }
  /** @zh-cn
   * 停止/恢复接收所有视频流。
   *
   * @param {boolean} mute
   * - true：停止接收所有视频流
   * - false：继续接收所有视频流（默认）
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Stops or resumes subscribing to the video streams of all remote users.
   *
   * As of v3.3.1, after successfully calling this method, the local user
   * stops or resumes
   * subscribing to the video streams of all remote users, including all
   * subsequent users.
   *
   * @note
   * - Call this method after joining a channel.
   * - See recommended settings in *Set the Subscribing State*.
   *
   * @param mute Sets whether to stop subscribing to the video streams of
   * all remote users.
   * - true: Stop subscribing to the video streams of all remote users.
   * - false: (Default) Resume subscribing to the video streams of all remote
   * users.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  muteAllRemoteVideoStreams(mute: boolean): number {
    return this.rtcChannel.muteAllRemoteVideoStreams(mute);
  }
  /** @zh-cn
   * 停止/恢复接收指定视频流。
   *
   * 如果之前有调用过 {@link muteAllRemoteVideoStreams}(true) 停止订阅所有远端
   * 视频，在调用 `muteRemoteVideoStreams` 之前请确保你已调用 {@link muteAllRemoteVideoStreams}(false)。
   *
   * `muteAllRemoteVideoStreams` 是全局控制，`muteRemoteVideoStream` 是精细控制。
   *
   * @param {number} uid 指定用户的 ID
   * @param {boolean} mute
   * - true：停止接收指定用户的视频流
   * - false：继续接收指定用户的视频流（默认）
   * @returns
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Stops or resumes subscribing to the video stream of a specified user.
   *
   * @note
   * - Call this method after joining a channel.
   * - See recommended settings in *Set the Subscribing State*.
   *
   * @param userId The user ID of the specified remote user.
   * @param mute Sets whether to stop subscribing to the video stream of a
   * specified user.
   * - true: Stop subscribing to the video stream of a specified user.
   * - false: (Default) Resume subscribing to the video stream of a specified
   * user.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  muteRemoteVideoStream(uid: number, mute: boolean): number {
    return this.rtcChannel.muteRemoteVideoStream(uid, mute);
  }
  /** @zh-cn
   * 设置订阅的视频流类型。
   *
   * 在网络条件受限的情况下，如果发送端没有调用 {@link enableDualStreamMode}(false) 关闭双流模式，
   * 接收端可以选择接收大流还是小流。其中，大流可以接为高分辨率高码率的视频流，小流则是低分辨率低码率的视频流。
   *
   * 正常情况下，用户默认接收大流。如需接收小流，可以调用本方法进行切换。SDK 会根据视频窗口的大小动态调整对应视频流的大小，以节约带宽和计算资源。
   *
   * 视频小流默认的宽高比和视频大流的宽高比一致。根据当前大流的宽高比，系统会自动分配小流的分辨率、帧率及码率。
   *
   * 调用本方法的执行结果将在 `apiCallExecuted` 中返回。
   * @param {number} uid 用户 ID
   * @param {StreamType} streamType 视频流类型
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Sets the stream type of the remote video.
   *
   * Under limited network conditions, if the publisher has not disabled the
   * dual-stream mode using {@link enableDualStreamMode}(false), the receiver
   * can choose to receive either the high-video stream (the high resolution,
   * and high bitrate video stream) or the low-video stream (the low
   * resolution, and low bitrate video stream).
   *
   * By default, users receive the high-video stream. Call this method if you
   * want to switch to the low-video stream. This method allows the app to
   * adjust the corresponding video stream type based on the size of the video
   * window to reduce the bandwidth and resources.
   *
   * The aspect ratio of the low-video stream is the same as the high-video
   * stream. Once the resolution of the high-video stream is set, the system
   * automatically sets the resolution, frame rate, and bitrate of the
   * low-video stream.
   * The SDK reports the result of calling this method in the
   * `apiCallExecuted` callback.
   *
   * @param uid The ID of the remote user sending the video stream.
   * @param streamType The video-stream type. See {@link StreamType}
   *
   * @return
   * - 0: Success
   * - < 0: Failure
   */
  setRemoteVideoStreamType(uid: number, streamType: StreamType): number {
    return this.rtcChannel.setRemoteVideoStreamType(uid, streamType);
  }
  /** @zh-cn
   * 设置默认订阅的视频流类型。
   *
   * 在网络条件受限的情况下，如果发送端没有调用 {@link enableDualStreamMode}(false) 关闭双流模式，
   * 接收端可以选择接收大流还是小流。其中，大流可以接为高分辨率高码率的视频流，小流则是低分辨率低码率的视频流。
   *
   * 正常情况下，用户接收大流。如需默认接收小流，可以调用本方法进行切换。SDK 会根据视频窗口的大小动态调整对应视频流的大小，以节约带宽和计算资源。
   *
   * 视频小流默认的宽高比和视频大流的宽高比一致。根据当前大流的宽高比，系统会自动分配小流的分辨率、帧率及码率。
   *
   * @param {StreamType} streamType 设置视频流的类型：
   * - 0：视频大流，即高分辨、高码率的视频流
   * - 1：视频小流，即低分辨、低码率的视频流
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Sets the default type of receiving video stream.
   *
   * Under limited network conditions, if the publisher has not disabled the
   * dual-stream mode using {@link enableDualStreamMode}(false), the receiver
   * can choose to receive either the high-video stream (the high resolution,
   * and high bitrate video stream) or the low-video stream (the low
   * resolution, and low bitrate video stream) by default.
   *
   * By default, users receive the high-video stream. Call this method if you
   * want to switch to the low-video stream. This method allows the app to
   * adjust the corresponding video stream type based on the size of the video
   * window to reduce the bandwidth and resources.
   *
   * The aspect ratio of the low-video stream is the same as the high-video
   * stream. Once the resolution of the high-video stream is set, the system
   * automatically sets the resolution, frame rate, and bitrate of the
   * low-video stream.
   *
   * @param streamType The video-stream type. See {@link StreamType}
   *
   * @return
   * - 0: Success
   * - < 0: Failure
   */
  setRemoteDefaultVideoStreamType(streamType: StreamType): number {
    return this.rtcChannel.setRemoteDefaultVideoStreamType(streamType);
  }
  /** @zh-cn
   * 创建数据流。
   *
   * 该方法用于创建数据流。`AgoraRtcChannel` 生命周期内，每个用户最多只能创建 5 个数据流。
   *
   * @note
   * - 频道内数据通道最多允许数据延迟 5 秒，若超过 5 秒接收方尚未收到数据流，则数据通道会向 App 报错。
   * - 请将 `reliable` 和 `ordered` 同时设置为 `true` 或 `false`，暂不支持交叉设置。
   *
   * @param {boolean} reliable
   * - `true`：接收方 5 秒内会收到发送方所发送的数据，否则会收到 `streamMessageError` 回调并获得相应报错信息
   * - `false`：接收方不保证收到，就算数据丢失也不会报错
   * @param {boolean} ordered
   * - `true`：接收方 5 秒内会按照发送方发送的顺序收到数据包
   * - `false`：接收方不保证按照发送方发送的顺序收到数据包
   * @returns {number}
   * - 创建数据流成功则返回数据流 ID
   * - < 0：创建数据流失败。如果返回的错误码是负数，对应错误代码和警告代码里的正整数
   */
  /**
   * Creates a data stream.
   *
   * Each user can create up to five data streams during the lifecycle of the
   * AgoraRtcChannel.
   *
   * @deprecated This method is deprecated from v3.3.1. Use the
   * {@link createDataStreamWithConfig} method instead.
   *
   * @note Set both the `reliable` and `ordered` parameters to `true` or
   * `false`. Do not set one as `true` and the other as `false`.
   *
   * @param reliable Sets whether or not the recipients are guaranteed to
   * receive the data stream from the sender within five seconds:
   * - true: The recipients receive the data stream from the sender within five
   * seconds. If the recipient does not receive the data stream within five
   * seconds, an error is reported to the application.
   * - false: There is no guarantee that the recipients receive the data stream
   * within five seconds and no error message is reported for any delay or
   * missing data stream.
   * @param ordered Sets whether or not the recipients receive the data stream
   * in the sent order:
   * - true: The recipients receive the data stream in the sent order.
   * - false: The recipients do not receive the data stream in the sent order.
   *
   * @return
   * - 0: Success
   * - < 0: Failure
   */
  createDataStream(reliable: boolean, ordered: boolean): number {
    return this.rtcChannel.createDataStream(reliable, ordered);
  }
  /** Creates a data stream.
   *
   * @since v3.3.1
   *
   * Each user can create up to five data streams in a single channel.
   *
   * This method does not support data reliability. If the receiver receives
   * a data packet five
   * seconds or more after it was sent, the SDK directly discards the data.
   *
   * @param config The configurations for the data stream.
   *
   * @return
   * - Returns the ID of the created data stream, if this method call succeeds.
   * - < 0: Fails to create the data stream.
   */
   createDataStreamWithConfig(config: DataStreamConfig) {
    return this.rtcChannel.createDataStream(config);
  }
  /** @zh-cn
   * 发送数据流。
   *
   * 该方法发送数据流消息到频道内所有用户。
   *
   * SDK 对该方法的实现进行了如下限制：频道内每秒最多能发送 30 个包，且每个包最大为 1 KB。 每个客户端每秒最多能发送 6 KB 数据。频道内每人最多能同时有 5 个数据通道。
   *
   * 成功调用该方法后，远端会触发 `streamMessage` 回调，远端用户可以在该回调中获取接收到的流消息；
   * 若调用失败，远端会触发 `streamMessageError` 回调。
   *
   * @note
   * - 该方法仅适用于通信场景以及直播场景下的主播用户，如果直播场景下的观众调用此方法可能会造成观众变主播。
   * - 请确保在调用该方法前，已调用 {@link createDataStream} 创建了数据通道。
   * @param {number} streamId 数据流 ID，{@link createDataStream} 的返回值
   * @param {string} msg 待发送的数据
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Sends data stream messages to all users in the channel.
   *
   * The SDK has the following restrictions on this method:
   * - Up to 30 packets can be sent per second in a channel with each packet
   * having a maximum size of 1 kB.
   * - Each client can send up to 6 kB of data per second.
   * - Each user can have up to five data streams simultaneously.
   *
   * Ensure that you have created the data stream using
   * {@link createDataStream} before calling this method.
   *
   * If the method call succeeds, the remote user receives the `streamMessage`
   * callback; If the method call fails, the remote user receives the
   * `streamMessageError` callback.
   *
   * @note This method applies to the users in the communication(`0`) profile or the
   * hosts in the `1` (live streaming) profile. If an audience in the
   * `1` (live streaming) profile calls this method, the role of the audience may be
   * switched to the host.
   *
   * @param streamId he ID of the sent data stream, returned in the
   * {@link createDataStream} method.
   * @param msg The data stream messages.
   *
   * @return
   * - 0: Success
   * - < 0: Failure
   */
  sendStreamMessage(streamId: number, msg: string): number {
    return this.rtcChannel.sendStreamMessage(streamId, msg);
  }
  /** @zh-cn
   * 增加旁路推流地址。
   *
   * 调用该方法后，SDK 会在本地触发 streamPublished 回调，报告增加旁路推流地址的状态。
   *
   * @note
   * - 该方法仅适用于直播场景下的主播，请在加入频道后调用该方法。
   * - 确保已开通旁路推流的功能，详见《推流到 CDN》的 “前提条件”。
   * - 该方法每次只能增加一路旁路推流地址。若需推送多路流，则需多次调用该方法。
   *
   * @param {string} url CDN 推流地址，格式为 RTMP。该字符长度不能超过 1024 字节，且不支持中文等特殊字符。
   * @param {bool} transcodingEnabled 设置是否转码：
   * - true: 转码。[转码](https://docs.agora.io/cn/Agora%20Platform/terms?platform=All%20Platforms#转码)是指在旁路推流时对音视频流进行转码处理后，
   * 再推送到其他 RTMP 服务器。多适用于频道内有多个主播，需要进行混流、合图的场景。如果设为 `true`，需先调用 {@link setLiveTranscoding} 方法。
   * - false: 不转码。
   * @returns
   * - 0：方法调用成功
   * - < 0：方法调用失败
   *  - `ERR_INVALID_ARGUMENT (2)`: RTMP 流地址为空或者字符长度为 0。
   *  - `ERR_NOT_INITIALIZED (7)`: 使用该功能之前没有初始化 `AgoraRtcChannel`。
   */
  /**
   * Publishes the local stream to a specified CDN URL address.
   *
   * In the `1` (live streaming) profile, the host can call this method to
   * publish the local stream to a specified CDN URL address, which is called
   * "Push Streams to CDN" or "CDN live streaming."
   *
   * During the CDN live streaming, the SDK triggers the
   * `rtmpStreamingStateChanged` callback is any streaming state changes.
   *
   * @note
   * - Only the host in the `1` (live streaming) profile can call this method.
   * - Call this method after the host joins the channel.
   * - Ensure that you enable the RTMP Converter service before using this
   * function. See *Prerequisites* in the *Push Streams to CDN* guide.
   * - This method adds only one stream RTMP URL address each time it is
   * called.
   *
   * @param url The CDN streaming URL in the RTMP format. The maximum length
   * of this parameter is 1024 bytes. The RTMP URL address must not contain
   * special characters, such as Chinese language characters.
   * @param transcodingEnabled Sets whether transcoding is enabled/disabled:
   * - true: Enable transcoding. To
   * [transcode](https://docs.agora.io/en/Agora%20Platform/terms?platform=All%20Platforms#transcoding)
   * the audio or video streams when publishing them to CDN live, often used
   * for combining the audio and video streams of multiple hosts in CDN live.
   * When you set this parameter as `true`, ensure that you call the
   * {@link setLiveTranscoding} method before this method.
   * - false: Disable transcoding.
   *
   * @return
   * - 0: Success
   * - < 0: Failure
   *  - `ERR_INVALID_ARGUMENT (2)`: The RTMP URL address is NULL or has a
   * string length of 0.
   *  - `ERR_NOT_INITIALIZED (7)`: You have not initialized `AgoraRtcChannel`
   * when publishing the stream.
   */
  addPublishStreamUrl(url: string, transcodingEnabled: boolean): number {
    return this.rtcChannel.addPublishStreamUrl(url, transcodingEnabled);
  }
  /** @zh-cn
   * 删除旁路推流地址。
   *
   * 调用该方法后，SDK 会在本地触发 `streamUnpublished` 回调，报告删除旁路推流地址的状态。
   *
   * @note
   * - 该方法只适用于直播场景下的用户。
   * - 该方法每次只能删除一路旁路推流地址。若需删除多路流，则需多次调用该方法。
   * - 推流地址不支持中文等特殊字符。
   * @param {string} url 待删除的推流地址，格式为 RTMP。该字符长度不能超过 1024 字节。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Removes the RTMP stream from the CDN.
   *
   * This method removes the RTMP URL address (added by
   * {@link addPublishStreamUrl}) and stops the CDN live streaming.
   *
   * This method call triggers the `rtmpStreamingStateChanged` callback to
   * report the state of removing the URL address.
   *
   * @note
   * - Only the host in the `1` (live streaming) profile can call this
   * method.
   * - This method removes only one RTMP URL address each time it is
   * called.
   * - This method applies to the `1` (live streaming) profile only.
   * - Call this method after {@link addPublishStreamUrl}.
   * @param url The RTMP URL address to be removed. The maximum length of this
   * parameter is 1024 bytes. The RTMP URL address must not contain special
   * characters, such as Chinese language characters.
   *
   * @return
   * - 0: Success
   * - < 0: Failure
   */
  removePublishStreamUrl(url: string): number {
    return this.rtcChannel.removePublishStreamUrl(url);
  }
  /** @zh-cn
   * 设置直播转码。
   *
   * 调用该方法更新 `transcoding` 参数时，SDK 会触发 `transcodingUpdated` 回调。
   *
   * @note
   * - 该方法只适用于直播场景下的主播。
   * - 请确保已开通 CDN 旁路推流的功能，详见《推流到 CDN》文档的 “前提条件”。
   * - 首次调用 {@link setLiveTranscoding} 方法设置 `transcoding` 时，不会触发该回调。
   *
   * @param {TranscodingConfig} transcoding 旁路推流转码合图相关设置
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Sets the video layout and audio settings for CDN live.
   *
   * The SDK triggers the `transcodingUpdated` callback when you call this
   * method to **update** the transcoding setting. If you call this method for
   * the first time to **set** the transcoding setting, the SDK does not
   * trigger the `transcodingUpdated` callback.
   *
   * @note
   * - Only the host in the Live-broadcast porfile can call this method.
   * - Ensure that you enable the RTMP Converter service before using
   * this function. See *Prerequisites* in the *Push Streams to CDN* guide.
   * - If you call the {@link setLiveTranscoding} method to set the
   * LiveTranscoding class for the first time, the SDK does not trigger the
   * transcodingUpdated callback.
   * @param transcoding The transcoding setting for the audio and video streams
   * during the CDN live streaming. See {@link LiveTranscoding}
   *
   * @return
   * - 0: Success
   * - < 0: Failure
   */
  setLiveTranscoding(transcoding: TranscodingConfig): number {
    return this.rtcChannel.setLiveTranscoding(transcoding);
  }
  /** @zh-cn
   * 导入在线媒体流。
   *
   * 该方法适用于 Native SDK v2.4.1 及之后的版本。
   *
   * 该方法通过在服务端拉取一路视频流并发送到频道中，将正在播出的视频导入到正在进行的直播中。
   * 可主要应用于赛事直播、多人看视频互动等直播场景。
   *
   * 调用该方法后，SDK 会在本地触发 `streamInjectStatus` 回调，报告导入在线媒体流的状态。
   * 成功导入媒体流后，该音视频流会出现在频道中，频道内所有用户都会收到 `userJoined` 回调，其中 `uid` 为 666。
   *
   * @note
   * - 该方法仅使用于直播。
   * - 调用该方法前，请确保已开通旁路推流的功能，详见[前提条件](https://docs.agora.io/cn/Interactive%20Broadcast/cdn_streaming_windows?platform=Windows#前提条件)。
   * - 请确保在成功加入频道后再调用该接口。
   * - 该方法每次只能增加一路媒体流地址。若需拉多路流，则需多次调用该方法。
   *
   * @param url 添加到直播中的媒体流 URL 地址，支持 RTMP， HLS， FLV 协议传输。
   * - 支持的 FLV 音频编码格式：AAC
   * - 支持的 FLV 视频编码格式：H264 (AVC)
   * @param config 外部导入的媒体流的配置。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   *  - `2`: 输入的 URL 为空。请重新调用该方法，并确认输入的媒体流的 URL 是有效的。
   *  - `7`: 引擎没有初始化。请确认调用该方法前已创建 `AgoraRtcEngine` 对象并完成初始化。
   *  - `4`: 频道非直播场景。请调用 {@link setChannelProfile} 并将频道设置为直播场景再调用该方法。
   *  - `3`: 用户没有加入频道。
   */
  /** @zh-cn
   * 输入在线媒体流。
   *
   * 该方法适用于 Native SDK v2.4.1 及之后的版本。
   *
   * 该方法通过在服务端拉取一路视频流并发送到频道中，将正在播出的视频输入到正在进行的直播中。
   * 可主要应用于赛事直播、多人看视频互动等直播场景。
   *
   * 调用该方法后，SDK 会在本地触发 `streamInjectStatus` 回调，报告导入在线媒体流的状态。
   * 成功导入媒体流后，该音视频流会出现在频道中，频道内所有用户都会收到 `userJoined` 回调，其中 `uid` 为 666。
   *
   * @warning 客户端输入在线媒体流功能即将停服。如果你尚未集成该功能，Agora 建议你不要使用。详见《部分服务下架计划》。
   *
   * @note
   * - 该方法仅使用于直播场景下的主播。
   * - 调用该方法前，请确保已开通旁路推流的功能，详见《推流到 CDN》文档的 “前提条件”。
   * - 请确保在成功加入频道后再调用该接口。
   * - 该方法每次只能增加一路媒体流地址。若需输入多路流，则需多次调用该方法。
   *
   * @param url 添加到直播中的媒体流 URL 地址，支持 RTMP， HLS， HTTP-FLV 协议。
   * - 支持的 FLV 音频编码格式：AAC
   * - 支持的 FLV 视频编码格式：H264 (AVC)
   * @param config 外部导入的媒体流的配置。
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   *  - `2`: 输入的 URL 为空。请重新调用该方法，并确认输入的媒体流的 URL 是有效的。
   *  - `7`: 引擎没有初始化。请确认调用该方法前已创建 `AgoraRtcChannel` 对象并完成初始化。
   *  - `4`: 频道非直播场景。请调用 {@link setChannelProfile} 并将频道设置为直播场景再调用该方法。
   *  - `3`: 用户没有加入频道。
   */
  /**
   * Injects the online media stream to a live streaming.
   *
   * If this method call is successful, the server pulls the voice or video
   * stream and injects it into a live channel. And all audience members in the
   * channel can watch a live show and interact with each other.
   *
   * This method call triggers the following callbacks:
   * - The local client:
   *  - `streamInjectedStatus`, reports the injecting status.
   *  - `userJoined`(uid:666), reports the stream is injected successfully and
   * the UID of this stream is 666.
   * - The remote client:
   *  - `userJoined`(uid:666), reports the stream is injected successfully and
   * the UID of this stream is 666.
   *
   * @warning Agora will soon stop the service for injecting online media
   * streams on the client. If you have not implemented this service, Agora
   * recommends that you do not use it.
   *
   * @note
   * - Only the host in the `1` (live streaming) profile can call this method.
   * - Ensure that you enable the RTMP Converter service before using this
   * function. See *Prerequisites* in the *Push Streams to CDN* guide.
   * - This method applies to the `1` (live streaming) profile only.
   * - You can inject only one media stream into the channel at the same time.
   *
   * @param url The URL address to be added to the ongoing live streaming.
   * Valid protocols are RTMP, HLS, and HTTP-FLV.
   * - Supported audio codec type: AAC.
   * - Supported video codec type: H264 (AVC).
   * @param config The configuration of the injected stream.
   * See InjectStreamConfig
   *
   * @return
   * - 0: Success
   * - < 0: Failure
   *  - ERR_INVALID_ARGUMENT (2): The injected URL does not exist. Call this
   * method again to inject the stream and ensure that the URL is valid.
   *  - ERR_NOT_READY (3): The user is not in the channel.
   *  - ERR_NOT_SUPPORTED (4): The channel profile is not live streaming.
   * Call the {@link setChannelProfile} method and set the channel profile to
   * live streaming before calling this method.
   *  - ERR_NOT_INITIALIZED (7): The SDK is not initialized. Ensure that the
   * `AgoraRtcChannel` object is initialized before calling this method.
   */
  addInjectStreamUrl(url: string, config: InjectStreamConfig): number {
    return this.rtcChannel.addInjectStreamUrl(url, config);
  }
  /** @zh-cn
   * 删除输入的在线媒体流。
   *
   * 成功删除后，会触发 `removeStream` 回调，其中 `uid` 为 `666`
   *
   * @warning 客户端输入在线媒体流功能即将停服。如果你尚未集成该功能，Agora 建议你不要使用。详见《部分服务下架计划》。
   *
   * @param {string} url 已导入、待删除的外部视频流 URL 地址
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Removes the injected the online media stream in a live streaming.
   *
   * This method removes the URL address (added by the
   * {@link addInjectStreamUrl} method) in a live streaming.
   *
   * If this method call is successful, the SDK triggers the `userOffline`
   * (uid:666) callback and report the UID of the removed stream is 666.
   *
   * @warning Agora will soon stop the service for injecting online media
   * streams on the client. If you have not implemented this service, Agora
   * recommends that you do not use it.
   *
   * @param url The URL address of the injected stream to be removed.
   *
   * @return
   * - 0: Success
   * - < 0: Failure
   */
  removeInjectStreamUrl(url: string): number {
    return this.rtcChannel.removeInjectStreamUrl(url);
  }
  /** @zh-cn
   * 开始跨频道媒体流转发。
   *
   * 该方法可用于实现跨频道连麦等场景。
   *
   * 成功调用该方法后，SDK 会触发 `channelMediaRelayState` 和 `channelMediaRelayEvent`
   * 回调，并在回调中报告当前的跨频道媒体流转发状态和事件。
   * - 如果 `channelMediaRelayState` 回调报告 {@link ChannelMediaRelayState} 中的
   * 状态码 `1` 和 {@link ChannelMediaRelayError} 中错误码为 `0`，且 `channelMediaRelayEvent` 回调报告
   * {@link ChannelMediaRelayEvent} 中的事件码 `4`，则表示 SDK 开始在源频道和目标频道
   * 之间转发媒体流。
   * - 如果 `channelMediaRelayState` 回调报告 {@link ChannelMediaRelayState} 中的
   * 状态码 `3`，则表示跨频道媒体流转发出现异常。
   *
   * @note
   * - 该功能需要联系 sales@agora.io 开通。
   * - 请在成功加入频道后调用该方法。
   * - 该方法仅对直播场景下的主播有效。
   * - 该功能不支持使用 String 型 `uid`。
   * - 成功调用该方法后，若你想再次调用该方法，必须先调用
   * {@link stopChannelMediaRelay} 方法退出当前的转发状态。
   *
   * @param config 跨频道媒体流转发参数配置
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Starts to relay media streams across channels.
   *
   * After a successful method call, the SDK triggers the
   * `channelMediaRelayState` and `channelMediaRelayEvent` callbacks, which
   * returns the state and event of the media stream relay.
   *
   * - If `channelMediaRelayState` returns the state code `2` and the error
   * code` 0`, and `channelMediaRelayEvent` returns the event code `4`, the
   * host starts sending data to the destination channel.
   * - If the `channelMediaRelayState` returns the state code `3`, an exception
   * occurs during the media stream relay.
   *
   * @note
   * - Contact sales-us@agora.io before implementing this function.
   * - Call this method after joining the channel.
   * - This method takes effect only when you are a host in a
   * live-broadcast channel.
   * - After a successful method call, if you want to call this method again,
   * ensure that you call the {@link stopChannelMediaRelay} method to quit the
   * current relay.
   * - We do not support string user accounts in this API.
   *
   * @param config The configuration of the media stream relay. See
   * ChannelMediaRelayConfiguration
   *
   * @return
   * - 0: Success
   * - < 0: Failure
   */
  startChannelMediaRelay(config: ChannelMediaRelayConfiguration): number {
    return this.rtcChannel.startChannelMediaRelay(config);
  }
  /** @zh-cn
   * 更新媒体流转发的频道。
   *
   * 成功开始跨频道转发媒体流后，如果你希望将流转发到多个目标频道，或退出当前的转发频道，可以
   * 调用该方法。
   *
   * 成功调用该方法后，SDK 会触发 `channelMediaRelayState` 回调，向你报告
   * {@link ChannelMediaRelayEvent} 中的 事件码 `7`。
   *
   * @note 请在 {@link startChannelMediaRelay} 方法后调用该方法，更新媒体流转发的频道。
   * @param config 跨频道媒体流转发参数配置
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Updates the channels for media stream relay.
   *
   * After a successful {@link startChannelMediaRelay} method call, if you want
   * to relay the media stream to more channels, or leave the current relay
   * channel, you can call the `updateChannelMediaRelay` method.
   *
   * After a successful method call, the SDK triggers the
   * `channelMediaRelayEvent` callback with the event code `7`.
   *
   * @note Call this method after the {@link startChannelMediaRelay} method to
   * update the destination channel.
   * @param config The configuration of the media stream relay. See
   * ChannelMediaRelayConfiguration
   *
   * @return
   * - 0: Success
   * - < 0: Failure
   */
  updateChannelMediaRelay(config: ChannelMediaRelayConfiguration): number {
    return this.rtcChannel.updateChannelMediaRelay(config);
  }
  /** @zh-cn
   * 停止跨频道媒体流转发。
   *
   * 一旦停止，主播会退出所有目标频道。
   *
   * 成功调用该方法后，SDK 会触发 `channelMediaRelayState` 回调。
   * 如果报告 {@link ChannelMediaRelayState} 中的状态码 `0` 和 {@link ChannelMediaRelayError}
   * 中的错误码 `0`，则表示已停止转发媒体流。
   *
   * @note
   * 如果该方法调用不成功，SDK 会触发 `channelMediaRelayState` 回调，并报告
   * {@link ChannelMediaRelayError} 中的错误码  `2` 或 `8`。你可以调用
   * {@link leaveChannel} 方法离开频道，跨频道媒体流转发会自动停止。
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Stops the media stream relay.
   *
   * Once the relay stops, the host quits all the destination channels.
   *
   * After a successful method call, the SDK triggers the
   * `channelMediaRelayState` callback. If the callback returns the state code
   * `0` and the error code `1`, the host successfully stops the relay.
   *
   * @note If the method call fails, the SDK triggers the
   * channelMediaRelayState callback with the error code `2` and `8` in
   * {@link ChannelMediaRelayError}. You can leave the channel by calling
   * the {@link leaveChannel} method, and
   * the media stream relay automatically stops.
   *
   * @return
   * - 0: Success
   * - < 0: Failure
   */
  stopChannelMediaRelay(): number {
    return this.rtcChannel.stopChannelMediaRelay();
  }
  /** @zh-cn
   * 获取当前网络连接状态。
   * @returns {ConnectionState} connect 网络连接状态
   */
  /**
   * Gets the connection state of the SDK.
   * @return {ConnectionState} Connect states. See {@link ConnectionState}.
   */
  getConnectionState(): ConnectionState {
    return this.rtcChannel.getConnectionState();
  }
  /** @zh-cn
   * 将本地音视频流发布到本频道。
   *
   * 该方法的调用需满足以下要求，否则 SDK 会返回错误码 `ERR_REFUSED (5)`:
   * - 该方法仅支持将音视频流发布到当前 `AgoraRtcChannel` 类所对应的频道。
   * - 直播场景下，该方法仅适用于角色为主播的用户。你可以调用该 `AgoraRtcChannel` 类下的
   * {@link setClientRole} 设置用户角色。
   * - SDK 只支持用户同一时间在一个频道发布一路音视频流。详情请参考高阶指南*多频道管理*。
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   *  - `ERR_REFUSED (5)`: 调用被拒绝
   */
  /**
   * Publishes the local stream to the channel.
   *
   * You must keep the following restrictions in mind when calling this method.
   * Otherwise, the SDK returns the `ERR_REFUSED (5)`:
   * - This method publishes one stream only to the channel corresponding to
   * the current `AgoraRtcChannel` object.
   * - In a live streaming channel, only a host can call this method.
   * To switch the client role, call {@link setClientRole} of the current
   * `AgoraRtcChannel` object.
   * - You can publish a stream to only one channel at a time. For details on
   * joining multiple channels, see the advanced guide *Join Multiple Channels*
   *
   * @return
   * - 0: Success
   * - < 0: Failure
   *  - ERR_REFUSED (5): The method call is refused.
   */
  publish(): number {
    return this.rtcChannel.publish()
  }
  /** @zh-cn
   * 停止将本地音视频流发布到本频道。
   *
   * 请确保你想要 `unpublish` 音视频流的频道 `channel`，与当前正在 {@link publish} 音
   * 视频流的频道 `channel` 一致，否则 SDK 会返回 `ERR_REFUSED (5)`。
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   *  - `ERR_REFUSED (5)`: 调用被拒绝
   */
  /**
   * Stops publishing a stream to the channel.
   *
   * If you call this method in a channel where you are not publishing streams,
   * the SDK returns #ERR_REFUSED (5).
   *
   * @return
   * - 0: Success
   * - < 0: Failure
   *  - ERR_REFUSED (5): The method call is refused.
   */
  unpublish(): number {
    return this.rtcChannel.unpublish()
  }
  /** @zh-cn
   * 离开频道。
   *
   * 离开频道，即机挂断或退出通话。
   *
   * 该方法会把回话相关的所有资源都释放掉。该方法是异步操作，调用返回时并没有真正退出频道。
   * 真正退出频道后，本地会触发 `leaveChannel` 回调；通信场景下的用户和直播场景下的主播离开频道后，远端会触发 `removeStream` 回调。
   *
   * @note
   * - 若想开始下一次通话，必须先调用该方法结束本次通话。
   * - 不管当前是否在通话中，都可以调用该方法，没有副作用。
   * - 如果你调用该方法后立即调用 {@link release} 方法，SDK 将无法触发 `leaveChannel` 回调。
   * - 如果你在输入在线媒体流的过程中调用了该方法， SDK 将自动调用 {@link removeInjectStreamUrl} 方法。
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Allows a user to leave a channel.
   *
   * Allows a user to leave a channel, such as hanging up or exiting a call.
   * The user must call the method to end the call before
   * joining another channel after call the {@link joinChannel} method.
   * This method returns 0 if the user leaves the channel and releases all
   * resources related to the call.
   * This method call is asynchronous, and the user has not left the channel
   * when the method call returns.
   *
   * Once the user leaves the channel, the SDK triggers the leavechannel
   * callback.
   *
   * A successful leavechannel method call triggers the removeStream callback
   * for the remote client when the user leaving the channel
   * is in the Communication channel, or is a host in the Live streaming
   * profile.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  leaveChannel(): number {
    return this.rtcChannel.leaveChannel()
  }
  /** @zh-cn
   * 释放 `AgoraRtcChannel` 所有资源。
   *
   * 调用该方法后，用户将无法再使用 AgoraRtcChannel 中的所有方法和回调。
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Releases all AgoraRtcChannel resource
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   *  - `ERR_NOT_INITIALIZED (7)`: The SDK is not initialized before calling
   * this method.
   */
  release(): number {
    return this.rtcChannel.release()
  }
  /** @zh-cn
   * @since v3.0.0
   *
   * 调节本地播放的指定远端用户音量。
   *
   * 你可以在通话中调用该方法调节指定远端用户在本地播放的音量。如需调节多个用户在本地播放的
   * 音量，则需多次调用该方法。
   *
   * @note
   * - 请在加入频道后，调用该方法。
   * - 该方法调节的是本地播放的指定远端用户混音后的音量。
   *
   * @param uid 远端用户 ID。
   * @param volume 播放音量，取值范围为 [0,100]:
   * - 0: 静音
   * - 100: 原始音量
   *
   * @returns {number}
   * - 0：方法调用成功
   * - < 0：方法调用失败
   */
  /**
   * Adjusts the playback volume of a specified remote user.
   *
   * You can call this method as many times as necessary to adjust the playback
   * volume of different remote users, or to repeatedly adjust the playback
   * volume of the same remote user.
   *
   * @note
   * - Call this method after joining a channel.
   * - The playback volume here refers to the mixed volume of a specified
   * remote user.
   * - This method can only adjust the playback volume of one specified remote
   * user at a time. To adjust the playback volume of different remote users,
   * call the method as many times, once for each remote user.
   *
   * @param uid The ID of the remote user.
   * @param volume The playback volume of the specified remote user. The value
   * ranges from 0 to 100:
   * - 0: Mute.
   * - 100: Original volume.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  adjustUserPlaybackSignalVolume(uid: number, volume: number): number {
    return this.rtcChannel.adjustUserPlaybackSignalVolume(uid, volume);
  }
  /** @zh-cn
   * 取消注册媒体附属信息观测器。
   *
   * @return
   * - 0: 方法调用成功
   * - < 0: 方法调用失败
   */
  /** Unregisters a media metadata observer.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  unRegisterMediaMetadataObserver(): number {
    return this.rtcChannel.unRegisterMediaMetadataObserver();
  }
  /** @zh-cn
   * 注册媒体附属信息观测器。
   *
   * @return
   * - 0: 方法调用成功
   * - < 0: 方法调用失败
   */
  /** Registers a media metadata observer.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  registerMediaMetadataObserver(): number {
    const fire = (event: string, ...args: Array<any>) => {
      setImmediate(() => {
        this.emit(event, ...args);
      });
    };

    this.rtcChannel.addMetadataEventHandler((metadata: Metadata) => {
      fire('receiveMetadata', metadata);
    }, (metadata: Metadata) => {
      fire('sendMetadataSuccess', metadata);
    });
    return this.rtcChannel.registerMediaMetadataObserver();
  }
  /** @zh-cn
   * 发送媒体附属信息。
   *
   * 调用 {@link registerMediaMetadataObserver} 后，你可以调用本方法来发送媒体附属信息。
   *
   * 如果发送成功，发送方会收到 `sendMetadataSuccess` 回调，接收方会收到 `receiveMetadata`
   * 回调。
   *
   * @param metadata 媒体附属信息。
   *
   * @return
   * - 0: 方法调用成功
   * - < 0: 方法调用失败
   */
  /** Sends the media metadata.
   *
   * After calling the {@link registerMediaMetadataObserver} method, you can
   * call the `setMetadata` method to send the media metadata.
   *
   * If it is a successful sending, the sender receives the
   * `sendMetadataSuccess` callback, and the receiver receives the
   * `receiveMetadata` callback.
   *
   * @param metadata The media metadata.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  sendMetadata(metadata: Metadata): number {
    return this.rtcChannel.sendMetadata(metadata);
  }
  /** @zh-cn
   * 设置媒体附属信息的最大大小。
   *
   * 调用 {@link registerMediaMetadataObserver} 后，你可以调用本方法来设置媒体附属信息
   * 的最大大小。
   *
   * @param size 媒体附属信息的最大大小。
   *
   * @return
   * - 0: 方法调用成功
   * - < 0: 方法调用失败
   */
  /** Sets the maximum size of the media metadata.
   *
   * After calling the {@link registerMediaMetadataObserver} method, you can
   * call the `setMaxMetadataSize` method to set the maximum size.
   *
   * @param size The maximum size of your metadata.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  setMaxMetadataSize(size: number): number {
    return this.rtcChannel.setMaxMetadataSize(size);
  }
  /** @zh-cn
   * 开启或关闭内置加密。
   *
   * @since v3.2.0
   *
   * 在安全要求较高的场景下，Agora 建议你在加入频道前，调用 `enableEncryption` 方法开启内置加密。
   *
   * 同一频道内所有用户必须使用相同的加密模式和密钥。一旦所有用户都离开频道，该频道的加密密钥会自动清除。
   *
   * **Note**:
   * - 如果开启了内置加密，则不能使用 RTMP/RTMPS 推流功能。
   * - SDK 返回错误码 `-4`，当设置的加密模式不正确或加载外部加密库失败。你需检查枚举值是否正确或
   * 重新加载外部加密库。
   *
   * @param enabled 是否开启内置加密：
   * - true: 开启
   * - false: 关闭
   * @param config 配置内置加密模式和密钥。
   *
   * @return
   * - 0: 方法调用成功
   * - < 0: 方法调用失败
   */
  /** Enables/Disables the built-in encryption.
   *
   * @since v3.2.0
   *
   * In scenarios requiring high security, Agora recommends calling this
   * method to enable the built-in encryption before joining a channel.
   *
   * All users in the same channel must use the same encryption mode and
   * encryption key. Once all users leave the channel, the encryption key of
   * this channel is automatically cleared.
   *
   * @note If you enable the built-in encryption, you cannot use the RTMP or
   * RTMPS streaming function.
   *
   * @param enabled Whether to enable the built-in encryption:
   * - true: Enable the built-in encryption.
   * - false: Disable the built-in encryption.
   * @param config Configurations of built-in encryption schemas. See
   * {@link EncryptionConfig}.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  enableEncryption(enabled: boolean, config: EncryptionConfig): number {
    return this.rtcChannel.enableEncryption(enabled, config);
  }
}



declare interface AgoraRtcChannel {
  /** @zh-cn
   * 成功加入频道。
   *
   * @param cb.uid 用户 ID
   *
   * @param cb.elapsed 从调用 {@link joinChannel} 开始到发生此事件过去的时间（毫秒)
   */
  /** Occurs when a user joins a specified channel.
   * @param cb.uid The User ID.
   * @param cb.elapsed Time elapsed (ms) from the user calling the
   * {@link joinChannel} method until the SDK triggers this callback.
   */
  on(evt: 'joinChannelSuccess', cb: (uid: number, elapsed: number) => void): this;
  /** @zh-cn
   * 发生警告回调。
   *
   * @param cb.warn 警告码
   * @param cb.msg 详细的警告信息
   */
  /**
   * Reports a warning during SDK runtime.
   * @param cb.warn Warning code.
   * @param cb.msg The warning message.
   */
  on(evt: 'channelWarning', cb: (warn: number, msg: string) => void): this;
  /** @zh-cn
   * 发生错误回调。
   *
   * @param cb.err 错误码
   *
   * @param cb.msg 详细的错误信息
   */
  /** Reports an error during SDK runtime.
   * @param cb.err Error code.
   * @param cb.msg The error message.
   */
  on(evt: 'channelError', cb: (err: number, msg: string) => void): this;
  /** @zh-cn
   * 重新加入频道回调。
   *
   * 有时候由于网络原因，客户端可能会和服务器失去连接，SDK 会进行自动重连，自动重连成功后触发此回调方法。
   *
   * @param cb.uid 用户 ID
   *
   * @param cb.elapsed 从调用 {@link joinChannel} 开始到发生此事件过去的时间（毫秒)
   */
  /** Occurs when a user rejoins the channel after disconnection due to network
   * problems.
   * When a user loses connection with the server because of network problems,
   * the SDK automatically tries to reconnect and triggers this callback upon
   * reconnection.
   * @param cb.uid User ID of the user joining the channel.
   * @param cb.elapsed Time elapsed (ms) from the user calling the
   * {@link joinChannel}
   * method until the SDK triggers this callback.
   */
  on(
    evt: 'rejoinChannelSuccess',
    cb: (uid: number, elapsed: number) => void
  ): this;
  /** @zh-cn
   * 用户离开频道。
   *
   * 调用 {@link leaveChannel} 离开频道后，SDK 触发该回调。
   */
  /** Occurs when the user leaves the channel.
   *
   * When the app calls the
   * {@link leaveChannel} method, the SDK uses
   * this callback to notify the app when the user leaves the channel.
   *
   * @param cb.stats The call statistics, see {@link RtcStats}
   */
  on(evt: 'leaveChannel', cb: (stats:RtcStats) => void): this;
  /** @zh-cn
   * 用户角色已切换回调。
   *
   * 回调由本地用户在加入频道后调用 {@link setClientRole} 改变用户角色触发的。
   *
   * @param cb.oldRole 切换前的角色
   *
   * @param cb.newRole 切换后的角色
   */
  /** Occurs when the user role switches in a live streaming.
   *
   * For example,
   * from a host to an audience or vice versa.
   *
   * This callback notifies the application of a user role switch when the
   * application calls the {@link setClientRole} method.
   *
   * @param cb.oldRole The old role, see {@link ClientRoleType}
   * @param cb.newRole The new role, see {@link ClientRoleType}
   */
   on(
    evt: 'clientRoleChanged',
    cb: (oldRole: ClientRoleType, newRole: ClientRoleType) => void
  ): this;
  /** @zh-cn
   * 远端用户（通信场景）/主播（直播场景）加入当前频道回调。
   *
   * - 通信场景下，该回调提示有远端用户加入了频道，并返回新加入用户的 ID；如果加入之前，已经有其他用户在频道中了，新加入的用户也会收到这些已有用户加入频道的回调。
   * - 直播场景下，该回调提示有主播加入了频道，并返回该主播的 ID。如果在加入之前，已经有主播在频道中了，新加入的用户也会收到已有主播加入频道的回调。声网建议连麦主播不超过 17 人。
   *
   * 该回调在如下情况下会被触发：
   * - 远端用户/主播调用 {@link joinChannel} 方法加入频道
   * - 远端用户加入频道后调用 {@link setClientRole} 将用户角色改变为主播
   * - 远端用户/主播网络中断后重新加入频道
   * - 主播通过调用 {@link addInjectStreamUrl} 方法成功导入在线媒体流
   *
   * @note 直播场景下
   * - 主播间能相互收到新主播加入频道的回调，并能获得该主播的 `uid`
   * - 观众也能收到新主播加入频道的回调，并能获得该主播的 `uid`
   * - 当 Web 端加入直播频道时，只要 Web 端有推流，SDK 会默认该 Web 端为主播，并触发该回调。
   *
   *
   * @param cb.uid 新加入频道的远端用户/主播 ID
   *
   * @param cb.elapsed 从本地调用 {@link joinChannel} 到发生此事件过去的时间（毫秒)
   *
   */
  /** Occurs when a user or host joins the channel.
   *
   * The SDK triggers this callback under one of the following circumstances:
   * - A remote user/host joins the channel by calling the {@link joinChannel}
   * method.
   * - A remote user switches the user role to the host by calling the
   * {@link setClientRole} method after joining the channel.
   * - A remote user/host rejoins the channel after a network interruption.
   * - The host injects an online media stream into the channel by calling
   * the {@link addInjectStreamUrl} method.
   *
   * @note In the `1` (live streaming) profile:
   * - The host receives this callback when another host joins the channel.
   * - The audience in the channel receives this callback when a new host
   * joins the channel.
   * - When a web application joins the channel, the SDK triggers this
   * callback as long as the web application publishes streams.
   *
   * @param cb.uid User ID of the user or host joining the channel.
   * @param cb.elapsed Time delay (ms) from the local user calling the
   * {@link joinChannel} method until the SDK triggers this callback.
   */
   on(evt: 'userJoined', cb: (uid: number, elapsed: number) => void): this;
   /** @zh-cn
   * 远端用户离开当前频道回调。
   *
   * 用户离开频道有两个原因：
   * - 正常离开的时候，远端用户/主播会发送类似“再见”的消息。接收此消息后，判断用户离开频道。
   * - 超时掉线的依据是，在一定时间内（约 20 秒），用户没有收到对方的任何数据包，则判定为对方掉线。在网络较差的情况下，有可能会误报。声网建议使用信令系统来做可靠的掉线检测。
   *
   * @param cb.uid 离线用户或主播的用户 ID。
   *
   * @param cb.reason 离线原因
   *   - `0`：用户主动离开。
   *   - `1`：因过长时间收不到对方数据包，超时掉线。注意：由于 SDK 使用的是不可靠通道，也有可能对方主动离开本方没收到对方离开消息而误判为超时掉线。
   *   - `2`：用户身份从主播切换为观众。
   */
   /** Occurs when a remote user (Communication)/host (Live streaming) leaves
   * the channel.
   *
   * There are two reasons for users to become offline:
   * - Leave the channel: When the user/host leaves the channel, the user/host
   * sends a goodbye message. When this message is received, the SDK determines
   * that the user/host leaves the channel.
   * - Drop offline: When no data packet of the user or host is received for a
   * certain period of time, the SDK assumes that the user/host drops
   * offline. A poor network connection may lead to false detections, so we
   * recommend using the signaling system for reliable offline detection.
   *
   * @param cb.uid ID of the user or host who leaves the channel or goes
   * offline.
   * @param cb.reason Reason why the user goes offline:
   *  - The user left the current channel.
   *  - The SDK timed out and the user dropped offline because no data packet
   * was received within a certain period of time. If a user quits the call
   * and the message is not passed to the SDK (due to an unreliable channel),
   * the SDK assumes the user dropped offline.
   *  - (Live streaming only.) The client role switched from the host to the
   * audience.
   */
   on(evt: 'userOffline', cb: (uid: number, reason: number) => void): this;
  /** @zh-cn
   * 网络连接中断，且 SDK 无法在 10 秒内连接服务器回调。
   *
   * @note SDK 在调用 {@link joinChannel} 后，无论是否加入成功，只要 10 秒和服务器无法连接
   * 就会触发该回调。如果 SDK 在断开连接后，20 分钟内还是没能重新加入频道，SDK 会停止尝试重连。
   */
  /** Occurs when the SDK cannot reconnect to Agora's edge server 10 seconds
   * after its connection to the server is interrupted.
   *
   * The SDK triggers this callback when it cannot connect to the server 10
   * seconds after calling the {@link joinChannel} method, whether or not it
   * is in the channel.
   */
   on(evt: 'connectionLost', cb: () => void): this;
  /** @zh-cn
   * Token 已过期回调。
   *
   * 调用 {@link joinChannel} 时如果指定了 Token，由于 Token 具有一定的时效，在通话过程中 SDK 可能由于网络原因和服务器失去连接，重连时可能需要新的 Token。
   *
   * 该回调通知 App 需要生成新的 Token，并需调用 {@link joinChannel} 为 SDK 指定新的 Token。
   */
  /** Occurs when the token expires.
   *
   * After a token(channel key) is specified by calling the {@link joinChannel}
   * method,
   * if the SDK losses connection with the Agora server due to network issues,
   * the token may expire after a certain period
   * of time and a new token may be required to reconnect to the server.
   *
   * This callback notifies the application to generate a new token and call
   * {@link joinChannel} to rejoin the channel with the new token.
   */
   on(evt: 'requestToken', cb: () => void): this;
  /** @zh-cn
   * Token 服务即将过期回调。
   *
   * 在调用 {@link joinChannel} 时如果指定了 Token，由于 Token 具有一定的时效，在通话过程中如果 Token 即将失效，SDK 会提前 30 秒触发该回调，提醒 App 更新 Token。当收到该回调时，用户需要重新在服务端生成新的 Token，然后调用 {@link renewToken} 将新生成的 Token 传给 SDK。
   *
   * @param cb.token 即将服务失效的 Token
   */
  /** Occurs when the token expires in 30 seconds.
   *
   * The user becomes offline if the token used in the {@link joinChannel}
   * method expires. The SDK triggers this callback 30 seconds
   * before the token expires to remind the application to get a new token.
   * Upon receiving this callback, generate a new token
   * on the server and call the {@link renewToken} method to pass the new
   * token to the SDK.
   *
   * @param cb.token The token that expires in 30 seconds.
   */
   on(evt: 'tokenPrivilegeWillExpire', cb: (token: string) => void): this;
  /** @zh-cn
   *
   * 通话相关统计信息。
   *
   * @param cb.stats 通话信息详情
   */
   /** Reports the statistics of the AgoraRtcChannel once every two seconds.
   *
   * @param cb.stats AgoraRtcChannel's statistics, see {@link RtcStats}
   */
   on(evt: 'rtcStats', cb: (stats: RtcStats) => void): this;
  /** @zh-cn
   * 通话中每个用户的网络上下行 last mile 质量报告回调。
   *
   * 该回调描述每个用户在通话中的 last mile 网络状态，其中 last mile 是指设备到 Agora 边缘服务器的网络状态。
   *
   * 该回调每 2 秒触发一次。如果远端有多个用户，该回调每 2 秒会被触发多次。
   *
   * @param cb.uid 用户 ID。表示该回调报告的是持有该 ID 的用户的网络质量。
   * 当 uid 为 0 时，返回的是本地用户的网络质量
   *
   * @param cb.txquality 该用户的上行网络质量，基于上行发送码率、上行丢包率、平均往返时延和网络
   * 抖动计算。
   *
   * @param cb.rxquality 该用户的下行网络质量，基于下行网络的丢包率、平均往返延时和网络抖动计算。
   *
   */
   /**
   * Reports the last mile network quality of each user in the channel
   * once every two seconds.
   *
   * Last mile refers to the connection between the local device and Agora's
   * edge server.
   *
   * @param cb.uid User ID. The network quality of the user with this uid is
   * reported.
   * If uid is 0, the local network quality is reported.
   * @param cb.txquality Uplink transmission quality rating of the user in
   * terms of
   * the transmission bitrate, packet loss rate, average RTT (Round-Trip Time),
   * and jitter of the uplink network. See {@link AgoraNetworkQuality}.
   * @param cb.rxquality Downlink network quality rating of the user in terms
   * of the
   * packet loss rate, average RTT, and jitter of the downlink network.
   * See {@link AgoraNetworkQuality}.
   */
   on(
    evt: 'networkQuality',
    cb: (
      uid: number,
      txquality: AgoraNetworkQuality,
      rxquality: AgoraNetworkQuality
    ) => void
  ): this;
  /** @zh-cn
   * 通话中远端视频流的统计信息回调。
   *
   * @param cb.stats 远端视频流统计信息
   */
  /** Reports the statistics of the video stream from each remote user/host.
   *
   * @param cb.stats Statistics of the received remote video streams. See
   * {@link RemoteVideoState}.
   */
  on(evt: 'remoteVideoStats', cb: (stats: RemoteVideoStats) => void): this;
  /** @zh-cn
   * 通话中远端音频流的统计信息回调。
   *
   * @param cb.stats 远端音频流统计信息
   */
  /** Reports the statistics of the audio stream from each remote user/host.
   *
   * @param cb.stats Statistics of the received remote audio streams. See
   * {@link RemoteAudioStats}.
   */
  on(evt: 'remoteAudioStats', cb: (stats: RemoteAudioStats) => void): this;
  /** @zh-cn
   * 远端音频流状态发生改变回调。
   *
   * 远端用户/主播音频状态发生改变时，SDK 会触发该回调向本地用户报告当前的远端音频流状态。
   *
   * @param cb.uid 发生音频状态改变的远端用户 ID。
   *
   * @param cb.state 远端音频流状态码
   *
   * @param cb.reason 远端音频流状态改变的原因码
   *
   * @param cb.elapsed 从本地用户调用 {@link joinChannel} 方法到发生本事件经历的时间，
   * 单位为 ms。
   */
  /**
   * Occurs when the remote audio state changes.
   *
   * This callback indicates the state change of the remote audio stream.
   *
   * @param cb.uid ID of the remote user whose audio state changes.
   *
   * @param cb.state State of the remote audio:
   * {@link RemoteAudioState}.
   *
   * @param cb.reason The reason of the remote audio state change:
   * {@link RemoteAudioStateReason}.
   *
   * @param cb.elapsed Time elapsed (ms) from the local user calling the
   * {@link joinChannel} method until the SDK triggers this callback.
   */
   on(evt: 'remoteAudioStateChanged', cb: (
    uid: number,
    state: RemoteAudioState,
    reason: RemoteAudioStateReason,
    elapsed: number
  ) => void): this;
  /** @zh-cn
   * 检测到活跃用户回调。
   *
   * 如果用户开启了 {@link enableAudioVolumeIndication} 功能，则当音量检测模块监测到频道内有新的活跃用户说话时，会通过本回调返回该用户的 `uid`。
   *
   * @param cb.uid 当前时间段内声音最大的用户的 `uid`（本地用户 `uid` 为 `0`）
   */
  /**
   * Reports which user is the loudest speaker.
   *
   * This callback returns the user ID of the user with the highest voice
   * volume during a period of time, instead of at the moment.
   *
   * @note To receive this callback, you need to call the
   * {@link enableAudioVolumeIndication} method.
   *
   * @param cb.uid User ID of the active speaker. A uid of 0 represents the
   * local user.
   * If the user enables the audio volume indication by calling the
   * {@link enableAudioVolumeIndication} method, this callback returns the uid
   * of the
   * active speaker detected by the audio volume detection module of the SDK.
   *
   */
   on(evt: 'activeSpeaker', cb: (uid: number) => void): this;
  /** @zh-cn
   * @depreacted 该回调已废弃，请改用 `remoteVideoStateChanged`。
   *
   * 已显示首帧远端视频回调。
   *
   * 第一帧远端视频显示在视图上时，触发此调用。
   *
   * @param cb.uid 用户 ID，指定是哪个用户的视频流
   *
   * @param cb.width 视频流宽（px）
   *
   * @param cb.height 视频流高（px）
   *
   * @param cb.elapsed 从本地调用 {@link joinChannel} 到发生此事件过去的时间（毫秒)
   */
  /** @deprecated This callback is deprecated, please use
   * `remoteVideoStateChanged` instead.
   *
   * Occurs when the first remote video frame is rendered.
   *
   * The SDK triggers this callback when the first frame of the remote video
   * is displayed in the user's video window.
   *
   * @param cb.uid User ID of the remote user sending the video stream.
   * @param cb.width Width (pixels) of the video frame.
   * @param cb.height Height (pixels) of the video stream.
   * @param cb.elapsed Time elapsed (ms) from the local user calling the
   * {@link joinChannel} method until the SDK triggers this callback.
   */
   on(
    evt: 'firstRemoteVideoFrame',
    cb: (uid: number, width: number, height: number, elapsed: number) => void
  ): this;
  /** @zh-cn
   * @deprecated 该回调已废弃，请改用 `remoteAudioStateChanged`。
   *
   * 已解码远端音频首帧的回调
   *
   * SDK 完成远端音频首帧解码，并发送给音频模块用以播放时，会触发此回调。有两种情况：
   * - 远端用户首次上线后发送音频
   * - 远端用户音频离线再上线发送音频。音频离线指本地在 15 秒内没有收到音频包，可能有如下原因：
   *  - 远端用户离开频道
   *  - 远端用户掉线
   *  - 远端用户停止发送音频流（通过调用 {@link muteLocalAudioStream} 方法）
   *  - 远端用户关闭音频 （通过调用 {@link disableAudio} 方法）
   *
   *
   * @param cb.uid 用户 ID，指定是哪个用户的音频流
   *
   * @param cb.elapsed 从本地用户调用 {@link joinChannel} 方法加入频道直至该回调触发的延迟，单位为毫秒
   *
   */
  /** @deprecated This callback is deprecated, please use
   * `remoteAudioStateChanged` instead.
   *
   * Occurs when the engine receives the first audio frame from a specified
   * remote user.
   * @param cb.uid User ID of the remote user sending the audio stream.
   * @param cb.elapsed The time elapsed (ms) from the local user calling the
   * {@link joinChannel} method until the SDK triggers this callback.
   */
   on(
    evt: 'firstRemoteAudioDecoded',
    cb: (uid: number, elapsed: number) => void
  ): this;
  /** @zh-cn
   * 本地或远端视频大小和旋转信息发生改变回调。
   *
   * @param cb.uid 图像尺寸和旋转信息发生变化的用户的用户 ID（本地用户的 `uid` 为 `0`）
   *
   * @param cb.width 视频流的宽度（px）
   *
   * @param cb.height 视频流的高度（px）
   *
   * @param cb.rotation 旋转信息 [0, 360]
   */
  /** Occurs when the video size or rotation of a specified user changes.
   * @param cb.uid User ID of the remote user or local user (0) whose video
   * size or
   * rotation changes.
   * @param cb.width New width (pixels) of the video.
   * @param cb.height New height (pixels) of the video.
   * @param cb.roation New height (pixels) of the video.
   */
  on(
    evt: 'videoSizeChanged',
    cb: (uid: number, width: number, height: number, rotation: number) => void
  ): this;
  /** @zh-cn
   * 远端用户视频流状态发生改变回调。
   *
   * @param cb.uid 发生视频流状态改变的远端用户的用户 ID。
   *
   * @param cb.state 远端视频流状态
   *
   * @param cb.reason 远端视频流状态改变的具体原因
   *
   * @param cb.elapsed 从本地用户调用 {@link joinChannel} 方法到发生本事件经历的时间，单位为 ms。
   */
  /** Occurs when the remote video state changes.
   *
   * @param cb.uid ID of the user whose video state changes.
   * @param cb.state State of the remote video.
   * See {@link RemoteVideoState}.
   * @param cb.reason The reason of the remote video state change.
   * See {@link RemoteVideoStateReason}
   * @param cb.elapsed Time elapsed (ms) from the local user calling the
   * {@link joinChannel} method until the SDK triggers this callback.
   */
   on(
    evt: 'remoteVideoStateChanged',
    cb: (
      uid: number,
      state: RemoteVideoState,
      reason: RemoteVideoStateReason,
      elapsed: number
    ) => void
  ): this;
  /** @zh-cn
   * 接收到对方数据流消息的回调。
   *
   * 该回调表示本地用户收到了远端用户调用 {@link sendStreamMessage} 方法发送的流消息。
   *
   *
   * @param cb.uid 用户 ID
   *
   * @param cb.streamId 数据流 ID
   *
   * @param cb.msg 接收到的流消息
   *
   * @param cb.len 流消息数据长度
   */
  /** Occurs when the local user receives the data stream from the remote
   * user within five seconds.
   *
   * The SDK triggers this callback when the local user receives the stream
   * message that the remote user sends by calling the
   * {@link sendStreamMessage} method.
   * @param cb.uid User ID of the remote user sending the message.
   * @param cb.streamId Stream ID.
   * @param cb.data The data received bt the local user.
   */
   on(
    evt: 'streamMessage',
    cb: (uid: number, streamId: number, data: string) => void
  ): this;
  /** @zh-cn
   * 接收对方数据流小时发生错误回调。
   *
   * 该回调表示本地用户未收到远端用户调用 {@link sendStreamMessage} 方法发送的流消息。
   *
   *
   * @param cb.uid 用户 ID
   *
   * @param cb.streamId 数据流 ID
   *
   * @param cb.err 错误代码
   *
   * @param cb.missed 丢失的消息数量
   *
   * @param cb.cached 数据流中断后，后面缓存的消息数量
   */
  /** Occurs when the local user does not receive the data stream from the
   * remote user within five seconds.
   *
   * The SDK triggers this callback when the local user fails to receive the
   * stream message that the remote user sends by calling the
   * {@link sendStreamMessage} method.
   *
   * @param cb.uid User ID of the remote user sending the message.
   * @param cb.streamId Stream ID.
   * @param cb.err Error code.
   * @param cb.missed Number of the lost messages.
   * @param cb.cached Number of incoming cached messages when the data stream
   * is interrupted.
   */
  on(
    evt: 'streamMessageError',
    cb: (
      uid: number,
      streamId: number,
      code: number,
      missed: number,
      cached: number
    ) => void
  ): this;
  /** @zh-cn
   * 跨频道媒体流转发状态发生改变回调。
   *
   * 当跨频道媒体流转发状态发生改变时，SDK 会触发该回调，并报告当前的转发状态以及相关的
   * 错误信息。
   *
   * @param cb.state 跨频道媒体流转发状态码
   *
   * @param cb.code 跨频道媒体流转发出错的错误码
   */
  /**
   * Occurs when the state of the media stream relay changes.
   *
   * The SDK reports the state of the current media relay and possible error
   * messages in this callback.
   *
   * @param cb.state The state code. See {@link ChannelMediaRelayState}.
   * @param cb.code The error code. See {@link ChannelMediaRelayError}.
   */
   on(evt: 'channelMediaRelayState', cb: (
    state: ChannelMediaRelayState,
    code: ChannelMediaRelayError
  ) => void): this;
  /** @zh-cn
   * 跨频道媒体流转发事件回调。
   *
   * 该回调报告跨频道媒体流转发过程中发生的事件。
   *
   * @param cb.event 跨频道媒体流转发事件码
   */
  /**
   * Reports events during the media stream relay.
   *
   * @param cb.event The event code. See {@link ChannelMediaRelayEvent}.
   */
  on(evt: 'channelMediaRelayEvent', cb: (
    event: ChannelMediaRelayEvent
  ) => void): this;
  /** @zh-cn
   * @deprecated 该回调已废弃，请改用 `remoteAudioStateChanged`。
   *
   * 已接收远端音频首帧回调。
   *
   * @param cb.uid 发送音频帧的远端用户的 ID
   *
   * @param cb.elapsed 从调用 {@link joinChannel} 方法直至该回调被触发的延迟（毫秒）
   */
  /** @deprecated This callback is deprecated. Please use
   * `remoteAudioStateChanged` instead.
   *
   * Occurs when the engine receives the first audio frame from a specific
   * remote user.
   *
   * @param cb.uid User ID of the remote user.
   * @param cb.elapsed Time elapsed (ms) from the local user calling
   * {@link joinChannel} until the
   * SDK triggers this callback.
   */
   on(
    evt: 'firstRemoteAudioFrame',
    cb: (uid: number, elapsed: number) => void
  ): this;

  on(evt: string, listener: Function): this;
  /** @zh-cn
   * RTMP 推流状态发生改变回调。
   *
   * 该回调返回本地用户调用 {@link addPublishStreamUrl} 或 {@link removePublishStreamUrl}
   * 方法的结果。
   *
   * RTMP 推流状态发生改变时，SDK 会触发该回调，并在回调中明确状态发生改变的 URL 地址及
   * 当前推流状态。该回调方便推流用户了解当前的推流状态；推流出错时，你可以通过返回的错误码
   * 了解出错的原因，方便排查问题。
   *
   *
   * @param cb.url 推流状态发生改变的 URL 地址
   * @param cb.state 推流状态：
   * - `0`: 推流未开始或已结束。成功调用 {@link removePublishStreamUrl} 后会返回该状态。
   * - `1`: 正在连接 Agora 推流服务器和 RTMP 服务器。调用 {@link addPublishStreamUrl}
   * 后会返回该状态。
   * - `2`: 推流正在进行。成功推流后，会返回该状态。
   * - `3`: 正在恢复推流。当 CDN 出现异常，或推流短暂中断时，SDK 会自动尝试恢复推流，并返回该状态。
   *  - 如成功恢复推流，则进入状态 `2`。
   *  - 如服务器出错或 60 秒内未成功恢复，则进入状态 `4`。如果觉得 60 秒太长，也可以主动调用
   * {@link addPublishStreamUrl}，再调用 {@link removePublishStreamUrl} 尝试重连。
   * - `4`: 推流失败。失败后，你可以通过返回的错误码排查错误原因，也可以再次调用
   * {@link addPublishStreamUrl} 重新尝试推流。
   * @param cb.code 推流错误码：
   * - `0`: 推流成功。
   * - `1`: 参数无效。请检查输入参数是否正确。
   * - `2`: 推流已加密，不能推流。
   * - `3`: 推流超时未成功。可调用 {@link addPublishStreamUrl} 重新推流。
   * - `4`: 推流服务器出现错误。请调用 {@link addPublishStreamUrl} 重新推流。
   * - `5`: RTMP 服务器出现错误。
   * - `6`: 推流请求过于频繁。
   * - `7`: 单个主播的推流地址数目达到上线 10。请删掉一些不用的推流地址再增加推流地址。
   * - `8`: 主播操作不属于自己的流。例如更新其他主播的流参数、停止其他主播的流。请检查 App 逻辑。
   * - `9`: 服务器未找到这个流。
   * - `10`: 推流地址格式有错误。请检查推流地址格式是否正确。
   */
  /**
   * Occurs when the state of the RTMP or RTMPS streaming changes.
   *
   * The SDK triggers this callback to report the result of the local user
   * calling the {@link addPublishStreamUrl} and {@link removePublishStreamUrl}
   * method.
   *
   * This callback indicates the state of the RTMP streaming. When exceptions
   * occur, you can troubleshoot issues by referring to the detailed error
   * descriptions in the `code` parameter.
   * @param cb.url The RTMP URL address.
   * @param cb.state The RTMP streaming state:
   * - `0`: The RTMP streaming has not started or has ended. This state is also
   * triggered after you remove an RTMP address from the CDN by calling
   * {@link removePublishStreamUrl}.
   * - `1`: The SDK is connecting to Agora's streaming server and the RTMP
   * server. This state is triggered after you call the
   * {@link addPublishStreamUrl} method.
   * - `2`: The RTMP streaming publishes. The SDK successfully publishes the
   * RTMP streaming and returns this state.
   * - `3`: The RTMP streaming is recovering. When exceptions occur to the CDN,
   * or the streaming is interrupted, the SDK tries to resume RTMP streaming
   * and returns this state.
   *  - If the SDK successfully resumes the streaming, `2` returns.
   *  - If the streaming does not resume within 60 seconds or server errors
   * occur, `4` returns. You can also reconnect to the server by calling the
   * {@link removePublishStreamUrl} and then {@link addPublishStreamUrl}
   * method.
   * - `4`: The RTMP streaming fails. See the `code` parameter for the
   * detailed error information. You can also call the
   * {@link addPublishStreamUrl} method to publish the RTMP streaming again.
   * @param cb.code The detailed error information:
   * - `0`: The RTMP streaming publishes successfully.
   * - `1`: Invalid argument used.
   * - `2`: The RTMP streams is encrypted and cannot be published.
   * - `3`: Timeout for the RTMP streaming. Call the
   * {@link addPublishStreamUrl} to publish the stream again.
   * - `4`: An error occurs in Agora's streaming server. Call the
   * {@link addPublishStreamUrl} to publish the stream again.
   * - `5`: An error occurs in the RTMP server.
   * - `6`: The RTMP streaming publishes too frequently.
   * - `7`: The host publishes more than 10 URLs. Delete the unnecessary URLs
   * before adding new ones.
   * - `8`: The host manipulates other hosts' URLs. Check your app
   * logic.
   * - `9`: Agora's server fails to find the RTMP stream.
   * - `10`: The format of the stream's URL address is not supported. Check
   * whether the URL format is correct.
   */
  on(evt: 'rtmpStreamingStateChanged', cb: (url: string, state: number, code: number) => void): this;
  /** @zh-cn
   * 旁路推流设置被更新回调。该
   *
   * 回调用于通知主播 CDN 转码已成功更新。
   *
   * {@link setLiveTranscoding} 方法中的转码合图参数（`LiveTranscoding`）更新时，`transcodingUpdated` 回调会被触发并向主播报告更新信息。
   *
   * @note 首次调用 {@link setLiveTranscoding} 方法设置转码合图参数（`LiveTranscoding`）时，不会触发此回调。
   */
  /** Occurs when the publisher's transcoding is updated.
   *
   * When the LiveTranscoding class in the setLiveTranscoding method updates,
   * the SDK triggers the transcodingUpdated callback to report the update
   * information to the local host.
   *
   * **Note**: If you call the {@link setLiveTranscoding} method to set the
   * LiveTranscoding class for the first time, the SDK does not trigger the
   * transcodingUpdated callback.
   */
  on(evt: 'transcodingUpdated', cb: () => void): this;
  /** @zh-cn
   * 输入在线媒体流状态回调。
   *
   * @warning 客户端输入在线媒体流功能即将停服。如果你尚未集成该功能，Agora 建议你不要使用。详见《部分服务下架计划》。
   *
   * {@link addInjectStreamUrl} 输入在线媒体流后，会触发该回调。
   * @param cb.url 输入频道内的在线媒体流地址
   * @param cb.uid 输入流的主播 UID
   * @param cb.status 输入流的状态：
   * - `0`: 输入频道成功。
   * - `1`: 输入的该媒体流在频道内已存在。
   * - `2`: 输入的该媒体流未经授权。
   * - `3`: 输入媒体流超时。
   * - `4`: 输入媒体流失败。
   * - `5`: 停止输入媒体流成功。
   * - `6`: 未找到要停止输入的媒体流。
   * - `7`: 停止输入的该媒体流未经授权。
   * - `8`: 停止输入媒体流超时。
   * - `9`: 停止输入媒体流失败。
   * - `10`: 输入媒体流被中断。
   *
   */
  /** Occurs when a voice or video stream URL address is added to a live
   * broadcast.
   *
   * @warning Agora will soon stop the service for injecting online media
   * streams on the client. If you have not implemented this service, Agora
   * recommends that you do not use it.
   *
   * @param cb.url The URL address of the externally injected stream.
   * @param cb.uid User ID.
   * @param cb.status State of the externally injected stream:
   *  - 0: The external video stream imported successfully.
   *  - 1: The external video stream already exists.
   *  - 2: The external video stream to be imported is unauthorized.
   *  - 3: Import external video stream timeout.
   *  - 4: Import external video stream failed.
   *  - 5: The external video stream stopped importing successfully.
   *  - 6: No external video stream is found.
   *  - 7: No external video stream is found.
   *  - 8: Stop importing external video stream timeout.
   *  - 9: Stop importing external video stream failed.
   *  - 10: The external video stream is corrupted.
   *
   */
   on(
    evt: 'streamInjectedStatus',
    cb: (url: string, uid: number, status: number) => void
  ): this;
  /** @zh-cn
   * 远端订阅流已回退为音频流回调。
   *
   * 如果你调用了设置远端订阅流回退选项 {@link setRemoteSubscribeFallbackOption} 并将 `option` 设置为 `2` 时， 当下行网络环境不理想、仅接收远端音频流时，或当下行网络改善、恢复订阅音视频流时，会触发该回调。
   *
   * 远端订阅流因弱网环境不能同时满足音视频而回退为小流时，你可以使用 `remoteVideoStats` 回调来监控远端视频大小流的切换。
   *
   *
   * @param cb.uid 远端用户的 ID
   *
   * @param cb.isFallbackOrRecover 远端订阅流已回退或恢复：
   *   - `true`：由于网络环境不理想，远端订阅流已回退为音频流
   *   - `false`：由于网络环境改善，订阅的音频流已恢复为音视频流
   */
  /** Occurs when the remote media stream falls back to audio-only stream due
   * to poor network conditions or switches back to the video stream after the
   * network conditions improve.
   *
   * If you call {@link setRemoteSubscribeFallbackOption} and set option as
   * AUDIO_ONLY(2), the SDK triggers this callback when
   * the remotely subscribed media stream falls back to audio-only mode due to
   * poor uplink conditions, or when the remotely subscribed media stream
   * switches back to the video after the uplink network condition improves.
   * @param cb.uid ID of the remote user sending the stream.
   * @param cb.isFallbackOrRecover Whether the remote media stream falls back
   * to audio-only or switches back to the video:
   *  - `true`: The remote media stream falls back to audio-only due to poor
   * network conditions.
   *  - `false`: The remote media stream switches back to the video stream
   * after the network conditions improved.
   */
  on(evt: 'remoteSubscribeFallbackToAudioOnly', cb: (
    uid: number,
    isFallbackOrRecover: boolean
  ) => void): this;
  // on(evt: 'refreshRecordingServiceStatus', cb: () => void): this;
  /** @zh-cn
   * 网络连接状态已改变回调。
   *
   * 该回调在网络连接状态发生改变的时候触发，并告知用户当前的网络连接状态，和引起网络状态改变的原因。
   *
   * @param cb.state 当前的网络连接状态
   *
   * @param cb.reason 引起当前网络连接状态发生改变的原因
   */
  /** Occurs when the connection state between the SDK and the server changes.
   * @param cb.state The connection state, see {@link ConnectionState}.
   * @param cb.reason The connection reason, see {@link ConnectionState}.
   */
  on(evt: 'connectionStateChanged', cb: (
    state: ConnectionState,
    reason: ConnectionChangeReason
  ) => void): this;
  /** @zh-cn
   * 音频发布状态改变回调。
   *
   * @since v3.2.0
   *
   * @param cb.channel 频道名。
   * @param cb.oldState 之前的发布状态。
   * @param cb.newState 当前的发布状态。
   * @param cb.elapseSinceLastState 两次状态变化时间间隔（毫秒）。
   */
  /** Occurs when the audio publishing state changes.
   *
   * @since v3.2.0
   *
   * This callback indicates the publishing state change of the local audio
   * stream.
   *
   * @param cb.channel The channel name.
   * @param cb.oldState The previous publishing state.
   * @param cb.newState The current publishing state.
   * @param cb.elapseSinceLastState The time elapsed (ms) from the previous state
   * to the current state.
   */
  on(evt: 'audioPublishStateChanged', cb: (
    oldState: STREAM_PUBLISH_STATE,
    newState: STREAM_PUBLISH_STATE,
    elapseSinceLastState: number
  )=> void): this;
  /** @zh-cn
   * 视频发布状态改变回调。
   *
   * @since v3.2.0
   *
   * @param cb.channel 频道名。
   * @param cb.oldState 之前的发布状态。
   * @param cb.newState 当前的发布状态。
   * @param cb.elapseSinceLastState 两次状态变化时间间隔（毫秒）。
   */
  /** Occurs when the video publishing state changes.
   *
   * @since v3.2.0
   *
   * This callback indicates the publishing state change of the local video
   * stream.
   *
   * @param cb.channel The channel name.
   * @param cb.oldState The previous publishing state.
   * @param cb.newState The current publishing state.
   * @param cb.elapseSinceLastState The time elapsed (ms) from the previous state
   * to the current state.
   */
  on(evt: 'videoPublishStateChanged', cb: (
    oldState: STREAM_PUBLISH_STATE,
    newState: STREAM_PUBLISH_STATE,
    elapseSinceLastState: number
  )=> void): this;
  /** @zh-cn
   * 音频订阅状态发生改变回调。
   *
   * @since v3.2.0
   *
   * @param cb.channel 频道名。
   * @param cb.uid 远端用户的 ID。
   * @param cb.oldState 之前的订阅状态。
   * @param cb.newState 当前的订阅状态。
   * @param cb.elapseSinceLastState 两次状态变化时间间隔（毫秒）。
   */
  /** Occurs when the audio subscribing state changes.
   *
   * @since v3.2.0
   *
   * This callback indicates the subscribing state change of a remote audio
   * stream.
   *
   * @param cb.channel The channel name.
   * @param cb.uid The ID of the remote user.
   * @param cb.oldState The previous subscribing state.
   * @param cb.newState The current subscribing state.
   * @param cb.elapseSinceLastState The time elapsed (ms) from the previous state
   * to the current state.
   */
  on(evt: 'audioSubscribeStateChanged', cb: (
    uid: number,
    oldState: STREAM_SUBSCRIBE_STATE,
    newState: STREAM_SUBSCRIBE_STATE,
    elapseSinceLastState: number
  )=> void): this;
  /** @zh-cn
   * 视频订阅状态发生改变回调。
   *
   * @since v3.2.0
   *
   * @param cb.channel 频道名。
   * @param cb.uid 远端用户的 ID。
   * @param cb.oldState 之前的订阅状态。
   * @param cb.newState 当前的订阅状态。
   * @param cb.elapseSinceLastState 两次状态变化时间间隔（毫秒）。
   *
   */
  /** Occurs when the video subscribing state changes.
   *
   * @since v3.2.0
   *
   * This callback indicates the subscribing state change of a remote video
   * stream.
   *
   * @param cb.channel The channel name.
   * @param cb.uid The ID of the remote user.
   * @param cb.oldState The previous subscribing state.
   * @param cb.newState The current subscribing state.
   * @param cb.elapseSinceLastState The time elapsed (ms) from the previous state
   * to the current state.
   */
  on(evt: 'videoSubscribeStateChanged', cb: (
    uid: number,
    oldState: STREAM_SUBSCRIBE_STATE,
    newState: STREAM_SUBSCRIBE_STATE,
    elapseSinceLastState: number
  )=> void): this;
}

export default AgoraRtcEngine;
