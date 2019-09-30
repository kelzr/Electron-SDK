
import {
  PluginInfo,
  Plugin
} from './plugin';

/** @zh-cn
 * 网络质量：
 * - 0：质量未知
 * - 1：质量极好
 * - 2：主观感觉和极好差不多，但码率可能略低于极好
 * - 3：主观感受有瑕疵但不影响沟通
 * - 4：勉强能沟通但不顺畅
 * - 5：网络质量非常差，基本不能沟通
 * - 6：网络连接已断开，完全无法沟通
 */
/**
 * Network quality types:
 *
 * - 0: The network quality is unknown.
 * - 1: The network quality is excellent.
 * - 2: The network quality is quite good, but the bitrate may be slightly 
 * lower than excellent.
 * - 3: Users can feel the communication slightly impaired.
 * - 4: Users cannot communicate smoothly.
 * - 5: The network is so bad that users can barely communicate.
 * - 6: The network is down and users cannot communicate at all.
 */
export type AgoraNetworkQuality =
  | 0 // unknown
  | 1 // excellent
  | 2 // good
  | 3 // poor
  | 4 // bad
  | 5 // very bad
  | 6; // down
 /** @zh-cn
  * 视频的编码类型：
  * - 0 VP8
  * - 1 （默认）H.264
  */
 /**
  * The codec type of the local video：
  * - 0: VP8
  * - 1: (Default) H.264
  */
export type VIDEO_CODEC_TYPE =
  | 0 // VP8
  | 1; // H264

/** @zh-cn
 * 用户角色类型：
 * - 1：主播
 * - 2：观众
 */
/**
 * Client roles in a live broadcast.
 *
 * - 1: Host.
 * - 2: Audience.
 */
export type ClientRoleType = 1 | 2;

/** @zh-cn
 * 视频流类型：
 * - 0：视频大流，即高分辨率、高码率视频流
 * - 1：视频小流，即低分辨率、低码率视频流
 */
/** Video stream types.
 *
 * - 0: High-stream video.
 * - 1: Low-stream video.
 */
export type StreamType = 0 | 1;

/** @zh-cn
 * 媒体设备类型：
 * - -1：未知的设备类型
 * - 0：音频播放设备
 * - 1：音频录制设备
 * - 2：视频渲染设备
 * - 3：视频采集设备
 * - 4：应用的音频播放设备
 */
/** Media Device type.
 * - -1: Unknown device type
 * - 0: Audio playback device
 * - 1: Audio recording device
 * - 2: Video renderer
 * - 3: Video capturer
 * - 4: Application audio playback device
 */
export type MediaDeviceType =
  | -1 // Unknown device type
  | 0 // Audio playback device
  | 1 // Audio recording device
  | 2 // Video renderer
  | 3 // Video capturer
  | 4; // Application audio playback device

/** @zh-cn
 * TranscodingUser 类。
 */
/**
 * The TranscodingUser class.
 */
export interface TranscodingUser {
  /** @zh-cn
   * 旁路推流的主播用户 ID
   * 
   */
  /** User ID of the user displaying the video in the CDN live. */
  uid: number;
  /** @zh-cn
   * 直播视频上用户视频在布局中的横坐标绝对值
   * 
   */
  /** Horizontal position from the top left corner of the video frame. */
  x: number;
  /** @zh-cn
   * 直播视频上用户视频在布局中的纵坐标绝对值
   * 
   */
  /** Vertical position from the top left corner of the video frame. */
  y: number;
  /** @zh-cn
   * 直播视频上用户视频的宽度，默认值为 360
   * 
   */
  /** Width of the video frame. The default value is 360. */
  width: number;
  /** @zh-cn
   * 直播视频上用户视频的高度，默认值为 640
   * 
   */
  /** Height of the video frame. The default value is 640. */
  height: number;

  /** @zh-cn
   * 直播视频上用户视频帧的图层编号。取值范围为 [0, 100] 中的整型：
   * - 最小值为 0（默认值），表示该区域图像位于最下层
   * - 最大值为 100，表示该区域图像位于最上层
   */
  /** 
   * Layer position of the video frame. The value ranges between 0 and 100.
   *
   * - 0: (Default) Lowest.
   * - 100: Highest.
   */
  zOrder: number;
  /** @zh-cn
   * 直播视频上用户视频的透明度。取值范围为 [0.0, 1.0]。0.0 表示该区域图像完全透
   * 明，而 1.0 表示该区域图像完全不透明。默认值为 1.0。 
   */
  /**  
   * Transparency of the video frame in CDN live. 
   * The value ranges between 0 and 1:
   *
   * - 0: Completely transparent.
   * - 1: (Default) Opaque.
   */
  alpha: number;
  /** @zh-cn
   * 直播音频所在声道。取值范围为 [0, 5]，默认值为 0。选项不为 0 时，需要特殊的播放器支持。
   * - 0：（推荐）默认混音设置，最多支持双声道，与主播端上行音频相关
   * - 1：对应主播的音频，推流中位于 FL 声道。如果主播上行为双声道，会先把多声道混音成单声道
   * - 2：对应主播的音频，推流中位于 FC 声道。如果主播上行为双声道，会先把多声道混音成单声道
   * - 3：对应主播的音频，推流中位于 FR 声道。如果主播上行为双声道，会先把多声道混音成单声道
   * - 4：对应主播的音频，推流中位于 BL 声道。如果主播上行为双声道，会先把多声道混音成单声道
   * - 5：对应主播的音频，推流中位于 BR 声道。如果主播上行为双声道，会先把多声道混音成单声道
   */
  /** The audio channel of the sound. 
   * - 0: (Default) Supports dual channels at most, depending on the upstream 
   * of the broadcaster.
   * - 1: The audio stream of the broadcaster uses the FL audio channel. 
   * If the upstream of the broadcaster uses multiple audio channels, 
   * these channels will be mixed into mono first.
   * - 2: The audio stream of the broadcaster uses the FC audio channel. 
   * If the upstream of the broadcaster uses multiple audio channels, 
   * these channels will be mixed into mono first.
   * - 3: The audio stream of the broadcaster uses the FR audio channel. 
   * If the upstream of the broadcaster uses multiple audio channels, 
   * these channels will be mixed into mono first.
   * - 4: The audio stream of the broadcaster uses the BL audio channel. 
   * If the upstream of the broadcaster uses multiple audio channels, 
   * these channels will be mixed into mono first.
   * - 5: The audio stream of the broadcaster uses the BR audio channel. 
   * If the upstream of the broadcaster uses multiple audio channels, 
   * these channels will be mixed into mono first.
   */
  audioChannel: number;
}

/** @zh-cn
 * 直播转码的相关配置。
 */
/** Sets the CDN live audio/video transcoding settings. */
export interface TranscodingConfig {
  /** @zh-cn
   * 用于旁路直播的输出视频的总宽度，默认值为 360。
   * 
   * width × height 的最小值为 16 × 16。
   */
  /** 
   * Width of the video. The default value is 360. 
   * 
   * If you push video streams to the CDN, set the value of width x height to 
   * at least 64 x 64 (px), or the SDK will adjust it to 64 x 64 (px).
   * 
   * If you push audio streams to the CDN, set the value of width x height to 
   * 0 x 0 (px).
   */
  width: number;
  /** @zh-cn
   * 用于旁路直播的输出视频的总高度，默认值为 640。
   * 
   * width × height 的最小值为 16 × 16。
   */
  /** 
   * Height of the video. The default value is 640. 
   * 
   * If you push video streams to the CDN, set the value of width x height to 
   * at least 64 x 64 (px), or the SDK will adjust it to 64 x 64 (px).
   * 
   * If you push audio streams to the CDN, set the value of width x height to 
   * 0 x 0 (px).
   */
  height: number;
  /** @zh-cn
   * 用于旁路直播的输出视频的码率，单位为 Kbps，默认值为 400 Kbps。
   * 
   * 用户可以根据码率参考表中的码率值进行设置；如果设置的码率超出合理范围，
   * Agora 服务器会在合理区间内自动调整码率值。 
   */
  /** Bitrate of the CDN live output video stream. 
   * 
   * The default value is 400 Kbps.
   * 
   * Set this parameter according to the Video Bitrate Table. If you set a 
   * bitrate beyond the proper range, the SDK automatically 
   * adapts it to a value within the range.
   */
  videoBitrate: number;
  /** @zh-cn
   * 用于旁路直播的输出视频的帧率，单位为帧每秒，取值范围为 [15, 30]，
   * 默认值为 15 fps。
   * 
   * 服务器会将低于 15 的帧率设置改为 15，将高于 30 的帧率设置改为 30。
   */
  /** 
   * Frame rate (fps) of the CDN live output video stream. 
   * The value range is (0, 30]. The default value is 15. 
   * 
   * **Note**: Agora adjusts all values over 30 to 30.
   */
  videoFrameRate: number;
  /** @zh-cn
   * 是否启用低延时模式：
   * - true：低延时，不保证画质
   * - false：（默认值）高延时，保证画质
   */
  /**
   * Latency mode.
   * - true: Low latency with unassured quality.
   * - false: (Default) High latency with assured quality.
   */
  lowLatency: boolean;
  /** @zh-cn
   * 用于旁路直播的输出视频的 GOP，单位为帧。默认值为 30 帧
   * 
   */
  /**
   * Video GOP in frames. The default value is 30 fps.
   */
  videoGop: number;
  /** @zh-cn
   * 用于旁路直播的输出视频的编解码规格。可以设置为 BASELINE、MAIN 或 HIGH；如果设置其他值，服务端会统一设为默认值 HIGH。
   * - VIDEO_CODEC_PROFILE_BASELINE = 66：Baseline 级别的视频编码规格，一般用于视频通话、手机视频等。
   * - VIDEO_CODEC_PROFILE_MAIN = 77：Main 级别的视频编码规格，一般用于主流消费类电子产品，如 mp4、便携的视频播放器、PSP 和 iPad 等
   * - VIDEO_CODEC_PROFILE_HIGH = 100：（默认）High 级别的视频编码规格，一般用于广播及视频碟片存储，高清电视
   */
  /** Self-defined video codec profile.
   * - VIDEO_CODEC_PROFILE_BASELINE = 66: Baseline video codec profile. 
   * Generally used in video calls on mobile phones.
   * - VIDEO_CODEC_PROFILE_MAIN = 77: Main video codec profile. 
   * Generally used in mainstream electronics, such as MP4 players, portable 
   * video players, PSP, and iPads.
   * - VIDEO_CODEC_PROFILE_HIGH = 100: (Default) High video codec profile. 
   * Generally used in high-resolution broadcasts or television.
   */
  videoCodecProfile: number;

  /** @zh-cn
   * 用于旁路直播的输出视频的背景色，格式为 RGB 定义下的十六进制整数（不要带 # 号），
   * 如 0xFFB6C1 表示浅粉色。默认0x000000，黑色。
   */
  /** 
   * The background color in RGB hex value. Value only, do not include a #. 
   * For example, 0xFFB6C1 (light pink). The default value is 0x000000 (black).
   */
  backgroundColor: number;
  /** @zh-cn
   * 获取旁路直播中的用户人数
   * 
   */
  /** The number of users in the live broadcast. */
  userCount: number;
  /** @zh-cn
   * 用于旁路直播的输出音频的采样率：
   * - AUDIO_SAMPLE_RATE_32000 = 32000
   * - AUDIO_SAMPLE_RATE_44100 = 44100（默认）
   * - AUDIO_SAMPLE_RATE_48000 = 48000
   */
  /** Self-defined audio-sample rate:
   * - AUDIO_SAMPLE_RATE_32000 = 32000 Hz
   * - AUDIO_SAMPLE_RATE_44100 = (Default)44100 Hz
   * - AUDIO_SAMPLE_RATE_48000 = 48000 Hz
   */
  audioSampleRate: number;
  /** @zh-cn
   * 用于旁路直播的输出音频的声道数，取值范围为 [1, 5] 中的整型，默认值为 1。建议取 1 或 2，其余三个选项需要特殊播放器支持：
   * - 1：单声道
   * - 2：双声道
   * - 3：三声道
   * - 4：四声道
   * - 5：五声道
   */
  /** 
   * Agora's self-defined audio-channel types. 
   * 
   * We recommend choosing option 1 or 2.
   * 
   * A special player is required if you choose option 3, 4, or 5:
   * - 1: (Default) Mono.
   * - 2: Two-channel stereo.
   * - 3: Three-channel stereo.
   * - 4: Four-channel stereo.
   * - 5: Five-channel stereo.
   */
  audioChannels: number;
  /** @zh-cn
   * 直播视频上的水印图片
   * 
   */
  /** The watermark image added to the CDN live publishing stream. */
  watermark: {
    /** @zh-cn
     * 直播视频上图片的 HTTP/HTTPS 地址，字符长度不得超过 1024 字节
     * 
     */
    /** 
     * HTTP/HTTPS URL address of the image on the broadcasting video.
     * 
     * The maximum length of this parameter is 1024 bytes.
     */
    url: string;
    /** @zh-cn
     * 图片左上角在视频帧上的横轴坐标。
     * 
     */
    /** Horizontal position of the image from the upper left of the 
     * broadcasting video. 
     */
    x: number;
    /** @zh-cn
     * 图片左上角在视频帧上的纵轴坐标。
     * 
     */
    /** Vertical position of the image from the upper left of the broadcasting 
     * video. 
     */
    y: number;
    /** @zh-cn
     * 图片在视频帧上的宽度。
     * 
     */
    /** Width of the image on the broadcasting video. */
    width: number;
    /** @zh-cn
     * 图片在视频帧上的高度。
     * 
     */
    /** Height of the image on the broadcasting video. */
    height: number;
  };
  /** @zh-cn
   * TranscodingUser 类。
   * 
   */
  /** The TranscodingUsers Array. */
  transcodingUsers: Array<TranscodingUser>;
}
/** @zh-cn
 * Last-mile 网络质量探测配置。
 */
/**
 * Configurations of the last-mile network probe test.
 */
export interface LastmileProbeConfig {
  /** @zh-cn
   * 是否探测上行网络。有些用户，如直播频道中的普通观众，不需要进行网络探测：
   * - true：探测
   * - false：不探测
   */
  /**
   * Sets whether or not to test the uplink network. Some users, for example, 
   * the audience in a Live-broadcast channel, do not need such a test.
   *
   * - true: test
   * - false: do not test
   */
  probeUplink: boolean;
  /** @zh-cn
   * 是否探测下行网络：
   * - true：探测
   * - false：不探测
   */
  /**
   * Sets whether or not to test the downlink network.
   *
   * - true: test
   * - false: do not test
   */
  probeDownlink: boolean;
  /** @zh-cn
   * 用户期望的最高发送码率，单位为 Kbps，范围为 [100, 5000]。
   */
  /**
   * The expected maximum sending bitrate (Kbps) of the local user. 
   * The value ranges between 100 and 5000.
   */
  expectedUplinkBitrate: number;
  /** @zh-cn
   * 用户期望的最高接收码率，单位为 Kbps，范围为 [100, 5000]。
   */
  /**
   * The expected maximum receiving bitrate (Kbps) of the local user. 
   * The value ranges between 100 and 5000.
   */
  expectedDownlinkBitrate: number;
}
/** @zh-cn
 * 单向 Last-mile 质量探测结果。
 */
/** The one-way last-mile probe result. */
export interface LastmileProbeOneWayResult {
  /** @zh-cn
   * 丢包率。
   * 
   */
  /** The packet loss rate (%). */
  packetLossRate: number;
  /** @zh-cn
   * 网络抖动，单位为毫秒。
   * 
   */
  /** The network jitter (ms). */
  jitter: number;
  /** @zh-cn
   * 可用网络带宽预计，单位为 Kbps。
   * 
   */
  /** The estimated available bandwidth (Kbps). */
  availableBandwidth: number;
}
/** @zh-cn
 * 上下行 Last-mile 质量探测结果。
 */
/** The uplink and downlink last-mile network probe test result. */
export interface LastmileProbeResult {
  /** @zh-cn
   * Last-mile 质量探测结果的状态，有如下几种：
   * - 1：表示本次 Last-mile 质量探测是完整的
   * - 2：表示本次 Last-mile 质量探测未进行带宽预测，因此结果不完整。一个可能的原因是测试资源暂时受限
   * - 3：未进行 Last-mile 质量探测。一个可能的原因是网络连接中断
   */
  /** States of the last-mile network probe test.
   *
   * - 1: The last-mile network probe test is complete.
   * - 2: The last-mile network probe test is incomplete and the bandwidth
   * estimation is not available, probably due to limited test resources.
   * - 3: The last-mile network probe test is not carried out, probably due 
   * to poor network conditions.
   */
  state: number;
  /** @zh-cn
   * 上行网络质量报告，详见 {@link LastmileProbeOneWayResult}。
   */
  /** 
   * The uplink last-mile network probe test result. 
   * See {@link LastmileProbeOneWayResult}. 
   */
  uplinkReport: LastmileProbeOneWayResult;
  /** @zh-cn
   * 下行网络质量报告，详见 {@link LastmileProbeOneWayResult}。
   */
  /** The downlink last-mile network probe test result. 
   * See {@link LastmileProbeOneWayResult}. 
   */
  downlinkReport: LastmileProbeOneWayResult;
  /** @zh-cn
   * 往返时延，单位为毫秒。
   */
  /** The round-trip delay time (ms). */
  rtt: number;
}

/** @zh-cn
 * UserInfo 对象。
 */
/** The user information. */
export interface UserInfo {
  /** @zh-cn
   * 用户 ID。
   */
   /** The user ID. */
  uid: number;
  /** @zh-cn
   * 用户 User account。
   */
  /** The user account. 
   * 
   * The maximum length of this parameter is 255 bytes.
   * 
   * Ensure that you set this parameter and do not set it as null.
   */
  userAccount: string;
}
/** @zh-cn
 * 本地语音的变声效果选项。
 * 
 */
/** Sets the local voice changer option. */
export enum VoiceChangerPreset {
  /** @zh-cn
   * 0：原声，即关闭本地语音变声。
   * 
   */
  /** 0: The original voice (no local voice change). */
  VOICE_CHANGER_OFF = 0,
  /** @zh-cn
   * 1：老男孩。
   * 
   */
  /** 1: An old man's voice. */
  VOICE_CHANGER_OLDMAN = 1,
  /** @zh-cn
   * 2：小男孩。
   * 
   */
  /** 2: A little boy's voice. */
  VOICE_CHANGER_BABYBOY = 2,
  /** @zh-cn3：小女孩。 */
  /** 3: A little girl's voice. */
  VOICE_CHANGER_BABYGIRL = 3,
  /** @zh-cn
   * 4：猪八戒。
   * 
   */
  /** 4: The voice of a growling bear. */
  VOICE_CHANGER_ZHUBAJIE = 4,
  /** @zh-cn
   * 5：空灵。
   * 
   */
  /** 5: Ethereal vocal effects. */
  VOICE_CHANGER_ETHEREAL = 5,
  /** @zh-cn
   * 6：绿巨人。
   * 
   */
  /** 6: Hulk's voice. */
  VOICE_CHANGER_HULK = 6
}
/** @zh-cn
 * 预设的本地语音混响效果选项：
 */
/**
 * Sets the local voice changer option.
 */
export enum AudioReverbPreset {
  /** @zh-cn
   * 0：原声，即关闭本地语音混响
   */
  /** 0: The original voice (no local voice reverberation). */
  AUDIO_REVERB_OFF = 0, // Turn off audio reverb
  /** @zh-cn
   * 1：流行 
   */
  /** 1: Pop music. */
  AUDIO_REVERB_POPULAR = 1,
  /** @zh-cn
   * 2：R&B
   */
  /** 2: R&B. */
  AUDIO_REVERB_RNB = 2,
  /** @zh-cn
   * 3：摇滚
   */
  /** 3: Rock music. */
  AUDIO_REVERB_ROCK = 3,
  /** @zh-cn
   * 4：嘻哈
   */
  /** 4: Hip-hop. */
  AUDIO_REVERB_HIPHOP = 4,
  /** @zh-cn
   * 5：演唱会
   */
  /** 5: Pop concert. */
  AUDIO_REVERB_VOCAL_CONCERT = 5,
  /** @zh-cn
   * 6：KTV
   */
  /** 6: Karaoke. */
  AUDIO_REVERB_KTV = 6,
  /** @zh-cn
   * 7：录音棚。
   */
  /** 7: Recording studio. */
  AUDIO_REVERB_STUDIO = 7
}
/** @zh-cn
 * 外部导入音视频流定义。
 */
/**
 * Configuration of the imported live broadcast voice or video stream.
 */
export interface InjectStreamConfig {

  /** @zh-cn
   * 添加进入直播的外部视频源宽度。默认值为 0，即保留视频源原始宽度。 
   */
  /** 
   * Width of the added stream in the live broadcast. 
   * 
   * The default value is 0 pixel (same width as the original stream). 
   */
  width: number;
  /** @zh-cn
   * 添加进入直播的外部视频源高度。默认值为 0，即保留视频源原始高度。 
   */
  /** 
   * Height of the added stream in the live broadcast. 
   * 
   * The default value is 0 pixel (same height as the original stream). 
   */
  height: number;
  /** @zh-cn
   * 添加进入直播的外部视频源码率。默认设置为 400 Kbps。 
   */
  /** 
   * Video bitrate of the added stream in the live broadcast. 
   * 
   * The default value is 400 Kbps. 
   */
  videoBitrate: number;
  /** @zh-cn
   * 添加进入直播的外部视频源帧率。默认值为 15 fps。 
   */
  /** Video frame rate of the added stream in the live broadcast. 
   * 
   * The default value is 15 fps. 
   */
  videoFrameRate: number;
  /** @zh-cn
   * 添加进入直播的外部视频源 GOP。默认值为 30 帧。 
   */
  /** Video GOP of the added stream in the live broadcast in frames. 
   * 
   * The default value is 30 fps. 
   */
  videoGop: number;
  /** @zh-cn
   * 添加进入直播的外部音频采样率。默认值为 44100。
   * **Note**：声网建议目前采用默认值，不要自行设置。
   * - AUDIO_SAMPLE_RATE_32000 = 32000
   * - AUDIO_SAMPLE_RATE_44100 = 44100（默认）
   * - AUDIO_SAMPLE_RATE_48000 = 48000
   */
  /**
   * Audio-sampling rate of the added stream in the live broadcast. 
   * 
   * The default value is 44100 Hz.
   * 
   * **Note**: Agora recommends setting the default value.
   * - AUDIO_SAMPLE_RATE_32000 = 32000 Hz
   * - AUDIO_SAMPLE_RATE_44100 = 44100 Hz
   * - AUDIO_SAMPLE_RATE_48000 = 48000 Hz
   */
  audioSampleRate: number;
  /** @zh-cn
   * 添加进入直播的外部音频码率。单位为 Kbps，默认值为 48。
   * **Note**：声网建议目前采用默认值，不要自行设置。
   */
  /**
   * Audio bitrate of the added stream in the live broadcast. 
   * 
   * The default value is 48 Kbps.
   * 
   * **Note**: Agora recommends setting the default value.
   */
  audioBitrate: number;
  /** @zh-cn
   * **Note**：添加进入直播的外部音频频道数。取值范围 [1, 2]，默认值为 1。
   * - 1：单声道（默认）
   * - 2：双声道立体声
   */
  /** Audio channels in the live broadcast.
   * - 1: (Default) Mono
   * - 2: Two-channel stereo
   * 
   * **Note**: Agora recommends setting the default value.
   */
  audioChannels: number;
}
/** @zh-cn
 * 远端用户媒体流的优先级。
 */
/**
 * The priority of the remote user.
 */
export enum Priority {
  /** @zh-cn
   * 50：用户媒体流的优先级为高。 
   */
  /** 50: The user's priority is high. */
  PRIORITY_HIGH = 50,
  /** @zh-cn
   * 100：（默认）用户媒体流的优先级正常。 
   */
  /** 100: (Default) The user's priority is normal. */
  PRIORITY_NORMAL = 100
}
/** @zh-cn
 * 通话相关的统计信息。
 */
/**
 * Statistics of the channel.
 */
export interface RtcStats {
  /** @zh-cn
   * 通话时长，单位为秒，累计值。
   */
  /** Call duration (s), represented by an aggregate value. */
  duration: number;
  /** @zh-cn
   * 发送字节数（bytes），累计值。
   */
  /** Total number of bytes transmitted, represented by an aggregate value. */
  txBytes: number;
  /** @zh-cn
   * 接收字节数（bytes），累计值。
   */
  /** Total number of bytes received, represented by an aggregate value. */
  rxBytes: number;
  /** @zh-cn
   * 发送码率（Kbps），瞬时值。
   */
  /** Transmission bitrate (Kbps), represented by an instantaneous value. */
  txKBitRate: number;
  /** @zh-cn
   * 接收码率（Kbps），瞬时值。
   */
  /** Receive bitrate (Kbps), represented by an instantaneous value. */
  rxKBitRate: number;
  /** @zh-cn
   * 音频接收码率（Kbps），瞬时值。
   */
  /** Audio receive bitrate (Kbps), represented by an instantaneous value. */
  rxAudioKBitRate: number;
  /** @zh-cn
   * 音频包的发送码率（Kbps），瞬时值。
   */
  /** Audio transmission bitrate (Kbps), represented by an instantaneous 
   * value. 
   */
  txAudioKBitRate: number;
  /** @zh-cn
   * 视频接收码率（Kbps），瞬时值。
   */
  /** Video receive bitrate (Kbps), represented by an instantaneous value. */
  rxVideoKBitRate: number;
  /** @zh-cn
   * 视频发送码率（Kbps），瞬时值。
   */
  /** Video transmission bitrate (Kbps), represented by an instantaneous 
   * value. 
   */
  txVideoKBitRate: number;
  /** @zh-cn
   * 接收音频字节数（bytes），累计值。
   */
  /** 
   * @since 2.9.0
   * 
   * Total number of audio bytes received (bytes), represented by an aggregate 
   * value. 
   */
  rxAudioKBytes: number;
  /** @zh-cn
   * 发送音频字节数（bytes），累计值。
   */
  /** 
   * @since 2.9.0
   * 
   * Total number of audio bytes sent (bytes), represented by an aggregate 
   * value. 
   */
  txAudioKBytes: number;
  /** @zh-cn
   * 接收视频字节数（bytes），累计值。
   */
  /** 
   * @since 2.9.0
   * 
   * Total number of video bytes received (bytes), represented by an aggregate 
   * value. 
   */
  rxVideoKBytes: number;
  /** @zh-cn
   * 发送视频字节数（bytes），累计值。
   */
  /** 
   * @since 2.9.0
   * 
   * Total number of video bytes sent (bytes), represented by an aggregate 
   * value. 
   */
  txVideoKBytes: number;
  /** @zh-cn
   * 客户端到边缘服务器的网络延迟（毫秒）。
   */
  /** Client-server latency(ms). */
  lastmileDelay: number;
  /** @zh-cn
   * 使用抗丢包技术前，客户端到 Agora 边缘服务器的丢包率(%)。
   */
  /** The packet loss rate (%) from the local client to Agora's edge server, 
   * before using the anti-packet-loss method.
   */
  txPacketLossRate: number;
  /** @zh-cn
   * 使用抗丢包技术前，Agora 边缘服务器到客户端的丢包率(%)。
   */
  /** The packet loss rate (%) from Agora's edge server to the local client,
   * before using the anti-packet-loss method.
   */
  rxPacketLossRate: number;
  /** @zh-cn
   * 当前频道内的人数。
   */
  /** Number of users in the channel. */
  userCount: number;
  /** @zh-cn
   * 当前系统的 CPU 使用率 (%)。
   */
  /** Application CPU usage (%). */
  cpuAppUsage: number;
  /** @zh-cn
   * 当前 App 的 CPU 使用率 (%)。
   */
  /** System CPU usage (%). */
  cpuTotalUsage: number;
}
/** @zh-cn
 * 本地视频自适应情况：
 */
/** Quality change of the local video. */
export enum QualityAdaptIndication {
  /** @zh-cn
   * 0：本地视频质量不变。 
   */
  /** 0: The quality of the local video stays the same. */
  ADAPT_NONE = 0,
  /** @zh-cn
   * 1：因网络带宽增加，本地视频质量改善。 
   */
  /** 1: The quality improves because the network bandwidth increases. */
  ADAPT_UP_BANDWIDTH = 1,
  /** @zh-cn
   * 2：因网络带宽减少，本地视频质量变差。 
   */
  /** 2: The quality worsens because the network bandwidth decreases. */
  ADAPT_DOWN_BANDWIDTH = 2
}
/** @zh-cn
 * 本地视频相关的统计信息。
 */
/** Statistics of the local video. */
export interface LocalVideoStats {
  /** @zh-cn
   * （实际发送码率 (Kbps)。 （Note: 不包含丢包后重传视频等的发送码率）
   */
  /** Bitrate (Kbps) sent in the reported interval, which does not include 
   * the bitrate of the re-transmission video after packet loss. 
   */
  sentBitrate: number;
  /** @zh-cn
   * 实际发送帧率 (fps)。 （Note: 不包含丢包后重传视频等的发送帧率）
   */
  /** Frame rate (fps) sent in the reported interval, which does not include 
   * the frame rate of the re-transmission video after packet loss.
   */
  sentFrameRate: number;
  /** @zh-cn
   * 本地编码器的输出帧率，单位为 fps。
   */
  /** The encoder output frame rate (fps) of the local video. */
  encoderOutputFrameRate: number;
  /** @zh-cn
   * 本地渲染器的输出帧率，单位为 fps。
   */
  /** The renderer output frame rate (fps) of the local video. */
  rendererOutputFrameRate: number;
  /** @zh-cn
   * 当前编码器的目标编码码率，单位为 Kbps，该码率为 SDK 根据当前网络状况预估的一个值。
   */
  /** The target bitrate (Kbps) of the current encoder. 
   * 
   * This value is estimated by the SDK based on the current network 
   * conditions.
   */
  targetBitrate: number;
  /** @zh-cn
   * 当前编码器的目标编码帧率，单位为 fps。
   */
  /** The target frame rate (fps) of the current encoder. */
  targetFrameRate: number;
  /** @zh-cn
   * 统计周期内本地视频质量（基于目标帧率和目标码率）的自适应情况。
   * 详见 {@link QualityAdaptIndication}。
   */
  /** Quality change of the local video in terms of target frame rate and 
   * target bit rate in this reported interval. 
   * See {@link QualityAdaptIndication}.
   */
  qualityAdaptIndication: QualityAdaptIndication;
  
  /** @zh-cn
   * 视频编码码率（Kbps）。
   * 
   * **Note**: 
   * 
   * 不包含丢包后重传视频等的编码码率。
   */
  /**
   * @since 2.9.0
   * 
   * The encoding bitrate (Kbps), which does not include the bitrate of the 
   * retransmission video after packet loss.
   */
  encodedBitrate: number;
  /** @zh-cn
   * 视频编码宽度（px）。
   */
  /**
   * @since 2.9.0
   * 
   * The width of the encoding frame (px).
   */
  encodedFrameWidth: number;
  /** @zh-cn
   * 视频编码高度（px）。
   */
  /**
   * @since 2.9.0
   * 
   * The height of the encoding frame (px).
   */
  encodedFrameHeight: number;
  /** @zh-cn
   * 视频发送的帧数，累计值。
   */
  /**
   * @since 2.9.0
   * 
   * The value of the sent frames, represented by an aggregate value.
   */
  encodedFrameCount: number;
  /** @zh-cn
   * 视频的编码类型，详见 {@link VIDEO_CODEC_TYPE}
   */
  /**
   * @since 2.9.0
   * 
   * The codec type of the local video. See {@link VIDEO_CODEC_TYPE}.
   */
  codecType: number;
}
/** @zh-ch
 * 本地音频统计数据。
 */
/** 
 * The statistics of the local audio stream
 */
export interface LocalAudioStats {
  /** @zh-ch
   * 声道数。
   */
  /**
   * The number of channels. 
   */
  numChannels: number;
  /** @zh-ch
   * 发送的采样率，单位为 Hz。
   */
  /**
   * The sample rate (Hz).
   */
  sentSampleRate: number;
  /** @zh-ch
   * 发送码率的平均值，单位为 Kbps。
   */
  /**
   * The average sending bitrate (Kbps).
   */
  sentBitrate: number;
}
/** @zh-ch
 * 视频编码属性定义。
 */
/** VideoEncoderConfiguration */
export interface VideoEncoderConfiguration {
  /** @zh-cn
   * 视频帧在横轴上的像素(px)。视频编码宽 x 高默认为 640 x 360。
   */
  /** Width (pixels) of the video. 
   * 
   * The default value is 640(width) x 360(hight).
   */
  width: number;
  /** @zh-cn
   * 视频帧在纵轴上的像素(px)。视频编码宽 x 高默认为 640 x 360。
   */
  /** Height (pixels) of the video. 
   *
   * The default value is 640(width) x 360(hight).
   */
  height: number;
  /** @zh-cn
   * 视频编码的帧率（fps）。
   * 
   * 默认值为 15 帧，建议不要超过 30 帧。
   */
  /**
   * The frame rate (fps) of the video. 
   * 
   * The default value is 15 fps.
   * 
   * **Noete**:
   * We do not recommend setting this to a value greater than 30 fps.
   */
  frameRate: number;
  /** @zh-cn
   * 最低视频编码帧率，单位为 fps。默认值为 -1。
   */
  /**
   * The minimum frame rate of the video. 
   * 
   * The default value is -1.
   */
  minFrameRate: number;
  /** @zh-cn
   * 视频编码的码率，单位为 Kbps。你可以根据场景需要，参考下面的视频基准码率参考表，手动设置你想要的码率。若设置的视频码率超出合理范围，SDK 会自动按照合理区间处理码率。
   * 你也可以选择如下一种模式：
   * - 0：（推荐）标准码率模式。该模式下，通信码率与基准码率一致；直播码率对照基准码率翻倍
   * - 1：适配码率模式。该模式下，视频在通信和直播模式下的码率与基准码率一致。
   *
   * **视频码率参考表**
   * <table>
   *     <tr>
   *         <th>分辨率</th>
   *         <th>帧率（fps）</th>
   *         <th>基准码率（通信场景）（Kbps）</th>
   *         <th>直播码率（直播场景）（Kbps）</th>
   *     </tr>
   *     <tr>
   *         <td>160 &times; 120</td>
   *         <td>15</td>
   *         <td>65</td>
   *         <td>130</td>
   *     </tr>
   *     <tr>
   *         <td>120 &times; 120</td>
   *         <td>15</td>
   *         <td>50</td>
   *         <td>100</td>
   *     </tr>
   *     <tr>
   *         <td>320 &times; 180</td>
   *         <td>15</td>
   *         <td>140</td>
   *         <td>280</td>
   *     </tr>
   *     <tr>
   *         <td>180 &times; 180</td>
   *         <td>15</td>
   *         <td>100</td>
   *         <td>200</td>
   *     </tr>
   *     <tr>
   *         <td>240 &times; 180</td>
   *         <td>15</td>
   *         <td>120</td>
   *         <td>240</td>
   *     </tr>
   *     <tr>
   *         <td>320 &times; 240</td>
   *         <td>15</td>
   *         <td>200</td>
   *         <td>400</td>
   *     </tr>
   *     <tr>
   *         <td>240 &times; 240</td>
   *         <td>15</td>
   *         <td>140</td>
   *         <td>280</td>
   *     </tr>
   *     <tr>
   *         <td>424 &times; 240</td>
   *         <td>15</td>
   *         <td>220</td>
   *         <td>440</td>
   *     </tr>
   *     <tr>
   *         <td>640 &times; 360</td>
   *         <td>15</td>
   *         <td>400</td>
   *         <td>800</td>
   *     </tr>
   *     <tr>
   *         <td>360 &times; 360</td>
   *         <td>15</td>
   *         <td>260</td>
   *         <td>520</td>
   *     </tr>
   *     <tr>
   *         <td>640 &times; 360</td>
   *         <td>30</td>
   *         <td>600</td>
   *         <td>1200</td>
   *     </tr>
   *     <tr>
   *         <td>360 &times; 360</td>
   *         <td>30</td>
   *         <td>400</td>
   *         <td>800</td>
   *     </tr>
   *     <tr>
   *         <td>480 &times; 360</td>
   *         <td>15</td>
   *         <td>320</td>
   *         <td>640</td>
   *     </tr>
   *     <tr>
   *         <td>480 &times; 360</td>
   *         <td>30</td>
   *         <td>490</td>
   *         <td>980</td>
   *     </tr>
   *     <tr>
   *         <td>640 &times; 480</td>
   *         <td>15</td>
   *         <td>500</td>
   *         <td>1000</td>
   *     </tr>
   *     <tr>
   *         <td>480 &times; 480</td>
   *         <td>15</td>
   *         <td>400</td>
   *         <td>800</td>
   *     </tr>
   *     <tr>
   *         <td>640 &times; 480</td>
   *         <td>30</td>
   *         <td>750</td>
   *         <td>1500</td>
   *     </tr>
   *     <tr>
   *         <td>480 &times; 480</td>
   *         <td>30</td>
   *         <td>600</td>
   *         <td>1200</td>
   *     </tr>
   *     <tr>
   *         <td>848 &times; 480</td>
   *         <td>15</td>
   *         <td>610</td>
   *         <td>1220</td>
   *     </tr>
   *     <tr>
   *         <td>848 &times; 480</td>
   *         <td>30</td>
   *         <td>930</td>
   *         <td>1860</td>
   *     </tr>
   *     <tr>
   *         <td>640 &times; 480</td>
   *         <td>10</td>
   *         <td>400</td>
   *         <td>800</td>
   *     </tr>
   *     <tr>
   *         <td>1280 &times; 720</td>
   *         <td>15</td>
   *         <td>1130</td>
   *         <td>2260</td>
   *     </tr>
   *     <tr>
   *         <td>1280 &times; 720</td>
   *         <td>30</td>
   *         <td>1710</td>
   *         <td>3420</td>
   *     </tr>
   *     <tr>
   *         <td>960 &times; 720</td>
   *         <td>15</td>
   *         <td>910</td>
   *         <td>1820</td>
   *     </tr>
   *     <tr>
   *         <td>960 &times; 720</td>
   *         <td>30</td>
   *         <td>1380</td>
   *         <td>2760</td>
   *     </tr>
   * </table>
   */
   /** The video encoding bitrate (Kbps).
    * 
    * Choose one of the following options:
    * - 0: (Recommended) The standard bitrate.
    *  - The Communication profile: the encoding bitrate equals the base 
    * bitrate.
    *  - The Live-broadcast profile: the encoding bitrate is twice the base 
    * bitrate.
    * - -1: The compatible bitrate: the bitrate stays the same regardless of 
    * the profile.
    *
    * The Communication profile prioritizes smoothness, while the 
    * Live-broadcast profile prioritizes video quality 
    * (requiring a higher bitrate). We recommend setting the bitrate mode to 
    * address this difference.
    *
    * The following table lists the recommended video encoder configurations, 
    * where the base bitrate applies to the Communication profile.
    * Set your bitrate based on this table. If you set a bitrate beyond the 
    * proper range, the SDK automatically sets it to within the range.
    *
    * <table>
    *     <tr>
    *         <th>Resolution</th>
    *         <th>Frame Rate (fps)</th>
    *         <th>Base Bitrate (Kbps, for Communication)</th>
    *         <th>Live Bitrate (Kbps, for Live Broadcast)</th>
    *     </tr>
    *     <tr>
    *         <td>160 &times; 120</td>
    *         <td>15</td>
    *         <td>65</td>
    *         <td>130</td>
    *     </tr>
    *     <tr>
    *         <td>120 &times; 120</td>
    *         <td>15</td>
    *         <td>50</td>
    *         <td>100</td>
    *     </tr>
    *     <tr>
    *         <td>320 &times; 180</td>
    *         <td>15</td>
    *         <td>140</td>
    *         <td>280</td>
    *     </tr>
    *     <tr>
    *         <td>180 &times; 180</td>
    *         <td>15</td>
    *         <td>100</td>
    *         <td>200</td>
    *     </tr>
    *     <tr>
    *         <td>240 &times; 180</td>
    *         <td>15</td>
    *         <td>120</td>
    *         <td>240</td>
    *     </tr>
    *     <tr>
    *         <td>320 &times; 240</td>
    *         <td>15</td>
    *         <td>200</td>
    *         <td>400</td>
    *     </tr>
    *     <tr>
    *         <td>240 &times; 240</td>
    *         <td>15</td>
    *         <td>140</td>
    *         <td>280</td>
    *     </tr>
    *     <tr>
    *         <td>424 &times; 240</td>
    *         <td>15</td>
    *         <td>220</td>
    *         <td>440</td>
    *     </tr>
    *     <tr>
    *         <td>640 &times; 360</td>
    *         <td>15</td>
    *         <td>400</td>
    *         <td>800</td>
    *     </tr>
    *     <tr>
    *         <td>360 &times; 360</td>
    *         <td>15</td>
    *         <td>260</td>
    *         <td>520</td>
    *     </tr>
    *     <tr>
    *         <td>640 &times; 360</td>
    *         <td>30</td>
    *         <td>600</td>
    *         <td>1200</td>
    *     </tr>
    *     <tr>
    *         <td>360 &times; 360</td>
    *         <td>30</td>
    *         <td>400</td>
    *         <td>800</td>
    *     </tr>
    *     <tr>
    *         <td>480 &times; 360</td>
    *         <td>15</td>
    *         <td>320</td>
    *         <td>640</td>
    *     </tr>
    *     <tr>
    *         <td>480 &times; 360</td>
    *         <td>30</td>
    *         <td>490</td>
    *         <td>980</td>
    *     </tr>
    *     <tr>
    *         <td>640 &times; 480</td>
    *         <td>15</td>
    *         <td>500</td>
    *         <td>1000</td>
    *     </tr>
    *     <tr>
    *         <td>480 &times; 480</td>
    *         <td>15</td>
    *         <td>400</td>
    *         <td>800</td>
    *     </tr>
    *     <tr>
    *         <td>640 &times; 480</td>
    *         <td>30</td>
    *         <td>750</td>
    *         <td>1500</td>
    *     </tr>
    *     <tr>
    *         <td>480 &times; 480</td>
    *         <td>30</td>
    *         <td>600</td>
    *         <td>1200</td>
    *     </tr>
    *     <tr>
    *         <td>848 &times; 480</td>
    *         <td>15</td>
    *         <td>610</td>
    *         <td>1220</td>
    *     </tr>
    *     <tr>
    *         <td>848 &times; 480</td>
    *         <td>30</td>
    *         <td>930</td>
    *         <td>1860</td>
    *     </tr>
    *     <tr>
    *         <td>640 &times; 480</td>
    *         <td>10</td>
    *         <td>400</td>
    *         <td>800</td>
    *     </tr>
    *     <tr>
    *         <td>1280 &times; 720</td>
    *         <td>15</td>
    *         <td>1130</td>
    *         <td>2260</td>
    *     </tr>
    *     <tr>
    *         <td>1280 &times; 720</td>
    *         <td>30</td>
    *         <td>1710</td>
    *         <td>3420</td>
    *     </tr>
    *     <tr>
    *         <td>960 &times; 720</td>
    *         <td>15</td>
    *         <td>910</td>
    *         <td>1820</td>
    *     </tr>
    *     <tr>
    *         <td>960 &times; 720</td>
    *         <td>30</td>
    *         <td>1380</td>
    *         <td>2760</td>
    *     </tr>
    * </table>
    */
  bitrate: number;
  /** @zh-cn
   * 最低视频编码码率。单位为 Kbps，默认值为 -1。
   * 该参数强制视频编码器输出高质量图片。如果将参数设为高于默认值，在网络状况不佳情况下可能会导致网络丢包，并影响视频播放的流畅度。因此如非对画质有特殊需求，Agora 建议不要修改该参数的值。
   */
  /**
   * The minimum encoding bitrate (Kbps). 
   * 
   * The default value is 1 kbps. 
   * 
   * Using a value greater than the default value 
   * forces the video encoder to output high-quality images but may cause more 
   * packet loss and hence sacrifice the smoothness of the video transmission. 
   * That said, unless you have special requirements for image quality, 
   * Agora does not recommend changing this value.
   *
   */
  minBitrate: number;
  /** @zh-cn
   * 视频编码的旋转模式，详见 {@link OrientationMode}
   */
  /** The orientation mode. See {@link OrientationMode}.*/
  orientationMode: OrientationMode;
  /** @zh-cn
   * 带宽受限时。视频编码的降低偏好。详见 {@link DegradationPreference}。
   */
  /**
   * The video encoding degradation preference under limited bandwidth. 
   * See {@link DegradationPreference}.
   */
  degradationPreference: DegradationPreference;
}
/** @zh-cn
 * 带宽受限时的视频编码降级偏好。
 */
/** The video encoding degradation preference under limited bandwidth. */
export enum DegradationPreference {

  /** @zh-cn
   * 0：（默认）降低编码帧率以保证视频质量。 
   */
  /** 0: (Default) Degrade the frame rate in order to maintain the video 
   * quality. 
   */
  MAINTAIN_QUALITY = 0,
  /** @zh-cn
   * 1：降低视频质量以保证编码帧率。 
   */
  /** 1: Degrade the video quality in order to maintain the frame rate. */
  MAINTAIN_FRAMERATE = 1,
  /** @zh-cn
   * 2：（预留参数，暂不支持）在编码帧率和视频质量之间保持平衡。 
   */
  /** 2: (For future use) Maintain a balance between the frame rate and video 
   * quality. 
   */
  MAINTAIN_BALANCED = 2,
}
/** @zh-cn
 * 视频编码的方向模式。
 */
/** The orientation mode. */
export enum OrientationMode  {
  /** @zh-cn
   * 0：（默认）该模式下 SDK 输出的视频方向与采集到的视频方向一致。接收端会根据收到的视频旋转信息对视频进行旋转。该模式适用于接收端可以调整视频方向的场景：
   * - 如果采集的视频是横屏模式，则输出的视频也是横屏模式
   * - 如果采集的视频是竖屏模式，则输出的视频也是竖屏模式
   */
 /**
  * 0: (Default) The output video always follows the orientation of the 
  * captured video, because the receiver takes the rotational information 
  * passed on from the video encoder. 
  * 
  * Mainly used between Agora’s SDKs.
  * - If the captured video is in landscape mode, the output video is in 
  * landscape mode.
  * - If the captured video is in portrait mode, the output video is in 
  * portrait mode.
  */
  ORIENTATION_MODE_ADAPTIVE = 0,
  /** @zh-cn
   * 1：该模式下 SDK 固定输出风景（横屏）模式的视频。如果采集到的视频是竖屏模式，则视频编码器会对其进行裁剪。该模式适用于当接收端无法调整视频方向时，如使用 CDN 推流场景下
   */
  /**
   * 1: The output video is always in landscape mode. 
   * 
   * If the captured video is 
   * in portrait mode, the video encoder crops it to fit the output. Applies to 
   * situations where the receiving end cannot process the rotational 
   * information. 
   * 
   * For example, CDN live streaming.
   */
  ORIENTATION_MODE_FIXED_LANDSCAPE = 1,
 /** @zh-cn
  * 2：该模式下 SDK 固定输出人像（竖屏）模式的视频，如果采集到的视频是横屏模式，则视频编码器会对其进行裁剪。该模式适用于当接收端无法调整视频方向时，如使用 CDN 推流场景下
  */
 /**
  * 2: The output video is always in portrait mode. 
  * 
  * If the captured video is in landscape mode, the video encoder crops it to 
  * fit the output. Applies to situations where the receiving end cannot process 
  * the rotational information. 
  * 
  * For example, CDN live streaming.
  */
  ORIENTATION_MODE_FIXED_PORTRAIT = 2,
}
/** @zh-cn
 * 远端视频相关的统计信息。
 */
/**
 * Video statistics of the remote stream.
 */
export interface RemoteVideoStats {
  /** @zh-cn
   * 用户 ID，指定是哪个用户的视频流。
   */
  /** User ID of the user sending the video streams. */
  uid: number;
  /** @zh-cn
   * @deprecated 该参数已废弃。
   *
   * 延迟，单位为毫秒。
   */
  /**
   * @deprecated This parameter is deprecated.
   * Time delay (ms).
   */
  delay: number;
  /** @zh-cn
   * 远端视频流宽度。
   */
  /** Width (pixels) of the remote video. */
  width: number;
  /** @zh-cn
   * 远端视频流高度。
   */
  /** Height (pixels) of the remote video. */
  height: number;
  /** @zh-cn
   * 接收码率，单位为 fps。
   */
  /** Bitrate (Kbps) received in the reported interval. */
  receivedBitrate: number;
  /** @zh-cn
   * 远端视频解码器的输出帧率，单位为 fps。
   */
  /** The decoder output frame rate (fps) of the remote video. */
  decoderOutputFrameRate: number;
  /** @zh-cn
   * 远端视频渲染器的输出帧率，单位为 fps。
   */
  /** The renderer output frame rate (fps) of the remote video. */
  rendererOutputFrameRate: number;
  /** @zh-cn
   * 视频流类型。
   * - 0：大流
   * - 1：小流
   */
  /**
   * Video stream type:
   * - 0: High-stream
   * - 1: Low-stream
   */
  rxStreamType: StreamType;
  /** @zh-cn
   * 远端用户在加入频道后发生视频卡顿的累计时长 (ms)。
   * 通话过程中，视频帧率设置不低于 5 fps 时，连续渲染的两帧视频之间间隔超过 500 ms，则记为一次视频卡顿。
   */
  /**
   * The total freeze time (ms) of the remote video stream after the 
   * remote user joins the channel.
   * 
   * In a video session where the frame rate is set to no less than 5 fps, 
   * video freeze occurs when the time interval between two adjacent renderable 
   * video frames is more than 500 ms.
   */
  totalFrozenTime: number;
  /** @zh-cn
   * 远端用户在加入频道后发生视频卡顿的累计时长占视频总有效时长的百分比 (%)。
   * 视频有效时长是指远端用户加入频道后视频未被停止发送或禁用的时长。
   */
  /**
   * The total video freeze time as a percentage (%) of the total time when 
   * the video is available.
   */
  frozenRate: number;
  /** @zh-cn
   * 远端视频在使用抗丢包技术之前的丢包率(%)。
   */
  /**
   * @since 2.9.0
   * 
   * Packet loss rate (%) of the remote video stream after using the 
   * anti-packet-loss method.
   */
  packetLossRate: number;
}
/** @zh-cn
 * 摄像头采集偏好。
 */
/** Sets the camera capturer configuration. */
export enum CaptureOutPreference {

  /** @zh-cn
   * 0：（默认）自动调整采集参数。SDK 根据实际的采集设备性能及网络情况，选择合适的摄像头输出参数，在设备性能及视频预览质量之间，维持平衡
   */
  /** 0: (Default) self-adapts the camera output parameters to the system 
   * performance and network conditions to balance CPU consumption and video 
   * preview quality.
   */
  CAPTURER_OUTPUT_PREFERENCE_AUTO = 0,
  /** @zh-cn
   * 1：优先保证设备性能。SDK 根据用户在 {@link AgoraRtcEngine.setVideoEncoderConfiguration setVideoEncoderConfiguration} 中设置编码器的分辨率和帧率，选择最接近的摄像头输出参数，从而保证设备性能。在这种情况下，预览质量接近于编码器的输出质量
   */
  /** 1: Prioritizes the system performance. 
   * 
   * The SDK chooses the dimension 
   * and frame rate of the local camera capture closest to those set 
   * by the {@link setVideoEncoderConfiguration} method.
   */
  CAPTURER_OUTPUT_PREFERENCE_PERFORMANCE = 1,
  /** @zh-cn
   * 2：优先保证视频预览质量。SDK 选择较高的摄像头输出参数，从而提高预览视频的质量。在这种情况下，会消耗更多的 CPU 及内存做视频前处理
   */
  /** 2: Prioritizes the local preview quality. 
   * 
   * The SDK chooses higher camera output parameters to improve the local 
   * video preview quality. This option requires extra CPU and RAM usage for 
   * video pre-processing.
   */
  CAPTURER_OUTPUT_PREFERENCE_PREVIEW = 2
}
/** @zh-cn
 * 摄像头采集偏好设置。
 */
/** Camera capturer configuration. */
export interface CameraCapturerConfiguration {
  /** @zh-cn
   * 摄像头采集输出偏好设置。
   */
  /** The output configuration of camera capturer. */
  preference: CaptureOutPreference;
}
/** @zh-cn
 * 待共享区域相对于整个屏幕或窗口的位置，如不填，则表示共享这个屏幕或窗口。
 */
/** The relative location of the region to the screen or window. */
export interface Rectangle {
  /** @zh-cn
   * 左上角的横向偏移。
   */
  /** The horizontal offset from the top-left corner. */
  x: number; // The horizontal offset from the top-left corner.
  /** @zh-cn
   * 左上角的纵向偏移。
   */
  /** The vertical offset from the top-left corner. */
  y: number; // The vertical offset from the top-left corner.
  /** @zh-cn
   * 待共享区域的宽。
   */
  /** The width of the region. */
  width: number; // The width of the region.
  /** @zh-cn
   * 待共享区域的高。
   */
  /** The height of the region. */
  height: number; // The height of the region.
}

export type ScreenSymbol = MacScreenSymbol | WindowsScreenSymbol;

export type MacScreenSymbol = number;

export type WindowsScreenSymbol = Rectangle;

export type CaptureRect = Rectangle;

/** @zh-cn
 * 屏幕共享的编码参数配置。
 */
/** Screen sharing encoding parameters. */
export interface CaptureParam {
  /** @zh-cn
   * 屏幕共享区域的宽。
   */
  /** Width (pixels) of the video. */
  width: number; // Width (pixels) of the video
  /** @zh-cn
   * 屏幕共享区域的高。
   */
  /** Height (pixels) of the video. */
  height: number; // Height (pixels) of the video

  /** @zh-cn
   * 共享视频的帧率，单位为 fps；默认值为 5，建议不要超过 15.
   */
  /** The frame rate (fps) of the shared region. 
   * 
   * The default value is 5. 
   * 
   * We do not recommend setting this to a value greater than 15. 
   */
  frameRate: number; // The frame rate (fps) of the shared region. The default value is 5. We do not recommend setting this to a value greater than 15.
  /** @zh-cn
   * 共享视频的码率，单位为 Kbps；默认值为 0，表示 SDK 根据当前共享屏幕的分辨率计算出一个合理的值。
   */
  /**
   * The bitrate (Kbps) of the shared region.
   * 
   * The default value is 0 (the SDK works out a bitrate according to the 
   * dimensions of the current screen).
   */
  bitrate: number; //  The bitrate (Kbps) of the shared region. The default value is 0 (the SDK works out a bitrate according to the dimensions of the current screen).
}
/** @zh-cn
 * 屏幕共享的内容类型。
 */
/**
 * Content hints for screen sharing.
 */
export enum VideoContentHint {
  /** @zh-cn
   * 0：（默认）无指定的内容类型。
   */
  /**
   * 0: (Default) No content hint.
   */
  CONTENT_HINT_NONE = 0,
  /** @zh-cn
   * 1：内容类型为动画。当共享的内容是视频、电影或视频游戏时，推荐选择该内容类型。
   */
  /**
   * 1: Motion-intensive content. 
   * 
   * Choose this option if you prefer smoothness or when you are sharing a 
   * video clip, movie, or video game.
   */
  CONTENT_HINT_MOTION = 1,
  /** @zh-cn
   * 2：内容类型为细节。当共享的内容是图片或文字时，推荐选择该内容类型。
   */
  /**
   * 2: Motionless content. 
   * 
   * Choose this option if you prefer sharpness or when you are sharing a 
   * picture, PowerPoint slide, or text.
   */
  CONTENT_HINT_DETAILS = 2
}

/** @zh-cn
 * @deprecated 该回调已经被废弃，请改用 remoteVideoStats 回调。
 * 远端视频流传输的统计信息。
 */
/**
 * @deprecated This callback is deprecated. Use the remoteVideoStats callback 
 * instead.
 * 
 * Reports the transport-layer statistics of each remote video stream.
 */
export interface RemoteVideoTransportStats {
  /** @zh-cn
   * 用户 ID，指定是哪个用户/主播的视频包。
   */
  /** User ID of the remote user sending the video packet. */
  uid: number;

  /** @zh-cn
   * 视频包从发送端到接收端的延时（毫秒）。
   */
  /** Network time delay (ms) from the remote user sending the video packet to 
   * the local user. 
   */
  delay: number;
  /** @zh-cn
   * 视频包从发送端到接收端的丢包率 (%)。
   */
  /** Packet loss rate (%) of the video packet sent from the remote user. */
  lost: number;
  /** @zh-cn
   * 远端视频包的接收码率（Kbps）。
   */
  /** Received bitrate (Kbps) of the video packet sent from the remote user. */
  rxKBitRate: number;
}
/** @zh-cn
 * 该回调已被废弃，请改用 remoteAudioStats 回调。
 * 远端音频流传输的统计信息。
 */
/**
 * @deprecated This callback is deprecated. Use the remoteAudioStats callback
 * instead.
 * 
 * Reports the transport-layer statistics of each remote audio stream.
 */
export interface RemoteAudioTransportStats {
  /** @zh-cn
   * 用户 ID，指定是哪个用户/主播的音频包。
   */
  /** User ID of the remote user sending the audio packet. */
  uid: number;
  /** @zh-cn
   * 音频包从发送端到接收端的延时（毫秒）。
   */
  /** Network time delay (ms) from the remote user sending the audio packet to 
   * the local user. 
   */
  delay: number;
  /** @zh-cn
   * 音频包从发送端到接收端的丢包率 (%)。
   */
  /** Packet loss rate (%) of the audio packet sent from the remote user. */
  lost: number;
  /** @zh-cn
   * 远端音频包的接收码率（Kbps）。
   */
  /** Received bitrate (Kbps) of the audio packet sent from the remote user. */
  rxKBitRate: number;
}
/** @zh-cn
 * 远端音频统计信息。
 */
/**
 * Reports the statistics of the remote audio.
 */
export interface RemoteAudioStats {
  /** @zh-cn
   * 用户 ID，指定是哪个用户/主播的音频流。 
   */
  /** User ID of the remote user sending the audio streams. */
  uid: number;
  /** @zh-cn
   * 远端用户发送的音频流质量，详见 {@link AgoraNetworkQuality}。 
   */
  /** Audio quality received by the user. See {@link AgoraNetworkQuality}. */
  quality: number;
  /** @zh-cn
   * 音频发送端到接收端的网络延迟（毫秒）。 
   */
  /** Network delay (ms) from the sender to the receiver. */
  networkTransportDelay: number;
  /** @zh-cn
   * 接收端到网络抖动缓冲的网络延迟（毫秒）。
   */
  /** Network delay (ms) from the receiver to the jitter buffer. */
  jitterBufferDelay: number;
  /** @zh-cn
   * 统计周期内的远端音频流的丢帧率(%)。
   */
  /** Packet loss rate in the reported interval. */
  audioLossRate: number;
  /** @zh-cn
   * 声道数。
   */
  /** The number of the channels. */
  numChannels: number;
  /** @zh-cn
   * 统计周期内接收到的远端音频采样率（Hz）。
   */
  /** 
   * The sample rate (Hz) of the received audio stream in the reported 
   * interval.
   */
  receivedSampleRate: number;
  /** @zh-cn
   * 接收流在统计周期内的平均码率（Kbps）。
   */
  /** The average bitrate (Kbps) of the received audio stream in the reported 
   * interval. 
   */
  receivedBitrate: number;
  /** @zh-cn
   * 远端用户在加入频道后发生音频卡顿的累计时长 (ms)。
   * 
   * 一个统计周期内，音频丢帧率达到 4% 即记为一次音频卡顿。
   * 
   * `totalFrozenTime` = 音频卡顿次数 x 2 x 1000 (ms)。
   */
  /**
   * The total freeze time (ms) of the remote audio stream after the remote 
   * user joins the channel.
   * 
   * In the reported interval, audio freeze occurs when the audio frame loss 
   * rate reaches 4%. `totalFrozenTime` = the number of audio freeze x 2 x 
   * 1000(ms).
   */
  totalFrozenTime: number;
  /** @zh-cn
   * 远端用户在加入频道后发生音频卡顿的累计时长占音频总有效时长的百分比 (%)。
   * 
   * 音频有效时长是指远端用户加入频道后音频未被停止发送或禁用的时长。
   */
  /** 
   * The total audio freeze time as a percentage (%) of the total time 
   * when the audio is available.
   */
  frozenRate: number;
}
/** @zh-cn
 * 远端视频状态：
 * - 0 远端视频默认初始状态。
 * - 1 本地用户已接收远端视频首包。
 * - 2 远端视频流正在解码，正常播放。
 * - 3 远端视频流卡顿。
 * - 4 远端视频流播放失败。
 */
/**
 * State of the remote video:
 * 
 * - 0: The remote video is in the default state.
 * - 1: The first remote video packet is received.
 * - 2: The remote video stream is decoded and plays normally.
 * - 3: The remote video is frozen.
 * - 4: The remote video fails to start.
 */
export type RemoteVideoState = 0 | 1 | 2 | 3 | 4;
/** @zh-cn
 * 远端视频流状态改变的具体原因：
 * - 0 内部原因。
 * - 1 网络阻塞。
 * - 2 网络恢复正常。
 * - 3 本地用户停止接收远端视频流或本地用户禁用视频模块。
 * - 4 本地用户恢复接收远端视频流或本地用户启动视频模块。
 * - 5 远端用户停止发送视频流或远端用户禁用视频模块。
 * - 6 远端用户恢复发送视频流或远端用户启用视频模块。
 * - 7 远端用户离开频道。
 * - 8 远端视频流已回退为音频流。
 * - 9 回退的远端音频流恢复为视频流。
 */
/**
 * The reason of the remote video state change:
 * - 0: Internal reasons.
 * - 1: Network congestion.
 * - 2: Network recovery.
 * - 3: The local user stops receiving the remote video stream or disables the 
 * video module.
 * - 4: The local user resumes receiving the remote video stream or enables the 
 * video module.
 * - 5: The remote user stops sending the video stream or disables the video 
 * module.
 * - 6: The remote user resumes sending the video stream or enables the video 
 * module.
 * - 7: The remote user leaves the channel.
 * - 8: The remote media stream falls back to the audio-only stream due to poor 
 * network conditions.
 * - 9: The remote media stream switches back to the video stream after the 
 * network conditions improve.
 */
export type RemoteVideoStateReason = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
/** @zh-cn
 * 远端音频流状态码：
 * - 0: 远端音频流默认初始状态，在原因码 3、5 或 7 的情况下，会报告该状态。
 * - 1: 本地用户已接收远端音频首包。
 * - 2: 远端音频流正在解码，正常播放。在原因码 2、4 或 6 的情况下，会报告该状态。
 * - 3: 远端音频流卡顿。在原因码 1 的情况下，会报告该状态。
 * - 4: 远端音频流播放失败。在 原因码 0 的情况下，会报告该状态。
 */ 
/**
 * State of the remote audio stream.
 * - 0: The remote audio is in the default state.
 * - 1: The first remote audio packet is received.
 * - 2: The remote audio stream is decoded and plays normally.
 * - 3: The remote audio is frozen.
 * - 4: The remote audio fails to start.
 */
export type RemoteAudioState = 0 | 1 | 2 | 3 | 4;
/** @zh-cn
 * 远端音频流状态改变的原因码：
 * - 0: 内部原因。
 * - 1: 网络阻塞。
 * - 2: 网络恢复正常。
 * - 3: 本地用户停止接收远端音频流或本地用户禁用音频模块。
 * - 4: 本地用户恢复接收远端音频流或本地用户启用音频模块。
 * - 5: 远端用户停止发送音频流或远端用户禁用音频模块。
 * - 6: 用户恢复发送音频流或远端用户启用音频模块。
 * - 7: 远端用户离开频道。
 */
 /**
* The reason of the remote audio state change.
* - 0: Internal reasons. 
* - 1: Network congestion. 
* - 2: Network recovery. 
* - 3: The local user stops receiving the remote audio stream or disables the 
* audio module. 
* - 4: The local user resumes receiving the remote audio stream or enables the 
* audio module. 
* - 5: The remote user stops sending the audio stream or disables the audio 
* module. 
* - 6: The remote user resumes sending the audio stream or enables the audio 
* module. 
* - 7: The remote user leaves the channel.
*/
export type RemoteAudioStateReason = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
/** @zh-cn
 * 网络连接状态。
 *
 * 1：网络连接断开。该状态表示 SDK 处于：
 * - 调用 {@link AgoraRtcEngine.joinChannel} 加入频道前的初始化阶段
 * - 或调用 {@link AgoraRtcEngine.leaveChannel} 后的离开频道阶段
 *
 * 2：建立网络连接中。该状态表示 SDK 在调用 {@link AgoraRtcEngine.joinChannel joinChannel} 后正在与指定的频道建立连接。
 * - 如果成功加入频道，App 会收到 connectionStateChanged 回调，通知当前网络状态变成 3：网络已连接
 * - 建议连接后，SDK 还会处理媒体初始化，一切就绪后会回调 joinedChannel
 *
 * 3：网络已连接。该状态表示用户已经加入频道，可以在频道内发布或订阅媒体流。如果因网络断开或切换而导致 SDK 与频道的连接中断，SDK 会自动重连，此时 App 会收到：
 * - connectionStateChanged 回调，通知网络状态变成 4：重新建立网络连接中
 *
 * 4：重新建立网络连接中。该状态表示 SDK 之前曾加入过频道，但因网络等原因连接中断了，此时 SDK 会自动尝试重新接入频道。
 * - 如果 SDK 无法在 10 秒内重新接入频道，则 connectionLost 会被触发，SDK 会一致保留该状态，并不断尝试重新加入频道
 * - 如果 SDK 在断开连接后，20 分钟内还是没能重新加入频道，App 会收到 connectionStateChanged 回调，通知当前网络状态进入 5：网络连接失败，SDK 停止尝试重连
 *
 * 5：网络连接失败。该状态表示 SDK 已不再尝试重新加入频道，用户必须要调用 {@link AgoraRtcEngine.leaveChannel leaveChannel} 离开频道。
 * - 如果用户还想重新加入频道，则需要再次调用 {@link AgoraRtcEngine.joinChannel joinChannel}
 * - 如果 SDK 因服务器端使用 RESTful API 禁止加入频道，则 App 会收到 connectionStateChanged 回调。
 */
/**
 * Connection states.
 * - 1: The SDK is disconnected from Agora's edge server.
 *  - This is the initial state before calling the 
 * {@link AgoraRtcEngine.joinChannel} method.
 *  - The SDK also enters this state when the application calls the 
 * {@link AgoraRtcEngine.leaveChannel} method.
 * - 2: The SDK is connecting to Agora's edge server. When the application 
 * calls the {@link AgoraRtcEngine.joinChannel} method, the SDK starts to 
 * establish a connection to the specified channel.
 *  - When the SDK successfully joins the channel, it triggers the 
 * connectionStateChanged callback and switches to the 3 state.
 *  - After the SDK joins the channel and when it finishes initializing the 
 * media engine, the SDK triggers the joinedChannel callback.
 * - 3: The SDK is connected to Agora's edge server and has joined a channel. 
 * You can now publish or subscribe to a media stream in the channel.If the 
 * connection to the channel is lost because, for example,
 * if the network is down or switched, the SDK automatically tries to reconnect 
 * and triggers:
 *  - The connectionStateChanged callback and switches to the 4 state.
 * - 4: The SDK keeps rejoining the channel after being disconnected from a 
 * joined channel because of network issues.
 *  - If the SDK cannot rejoin the channel within 10 seconds after being 
 * disconnected from Agora's edge server, the SDK triggers the connectionLost 
 * callback, stays in this state, and keeps rejoining the channel.
 *  - If the SDK fails to rejoin the channel 20 minutes after being 
 * disconnected from Agora's edge server, the SDK triggers the 
 * connectionStateChanged callback, switches to the 5 state, and stops 
 * rejoining the channel.
 * - 5: The SDK fails to connect to Agora's edge server or join the channel. 
 * You must call the {@link AgoraRtcEngine.leaveChannel leaveChannel} method 
 * to leave this state.
 *  - Calls the {@link AgoraRtcEngine.joinChannel joinChannel} method again to 
 * rejoin the channel.
 *  - If the SDK is banned from joining the channel by Agora's edge server 
 * (through the RESTful API), the SDK triggers connectionStateChanged 
 * callbacks.
 */
export type ConnectionState =
  | 1 // 1: The SDK is disconnected from Agora's edge server
  | 2 // 2: The SDK is connecting to Agora's edge server.
  | 3
  | 4
  | 5; // 5: The SDK fails to connect to Agora's edge server or join the channel.

  /** @zh-cn
   * 引起当前网络状态发生改变的原因：
   * - 0：建立网络连接中
   * - 1：成功加入频道
   * - 2：网络连接中断
   * - 3：网络连接被服务器禁止
   * - 4：加入频道失败。SDK 在尝试加入频道 20 分钟后还是没能加入频道，会返回该状态，并停止尝试重连
   * - 5：离开频道
   * - 6：不是有效的 APP ID。请更换有效的 APP ID 重新加入频道
   * - 7：不是有效的频道名。请更换有效的频道名重新加入频道
   * - 8：生成的 Token 无效
   * - 9：当前使用的 Token 过期，不再有效，需要重新在你的服务端申请生成 Token
   * - 10：此用户被服务器禁止
   * - 11：由于设置了代理服务器，SDK 尝试重连
   * - 12：更新 Token 引起网络连接状态改变
   * - 13：客户端 IP 地址变更，可能是由于网络类型，或网络运营商的 IP 或端口发生改变引起
   */
  /**
   * Reasons for a connection state change.
   * 
   * - 0: The SDK is connecting to Agora's edge server.
   * - 1: The SDK has joined the channel successfully.
   * - 2: The connection between the SDK and Agora's edge server is 
   * interrupted.
   * - 3: The connection between the SDK and Agora's edge server is banned by 
   * Agora's edge server.
   * - 4: The SDK fails to join the channel for more than 20 minutes and stops 
   * reconnecting to the channel.
   * - 5: The SDK has left the channel.
   * - 6: Invalid App ID.
   * - 7: Invalid Channel Name.
   * - 8: Invalid Token.
   * - 9: Token Expired.
   * - 10: This user has been banned by server.
   * - 11: SDK reconnects for setting proxy server.
   * - 12: Network status change for renew token.
   * - 13: Client IP Address changed.
   */
export type ConnectionChangeReason =
  | 0 // 0: The SDK is connecting to Agora's edge server.
  | 1 // 1: The SDK has joined the channel successfully.
  | 2 // 2: The connection between the SDK and Agora's edge server is interrupted.
  | 3 // 3: The connection between the SDK and Agora's edge server is banned by Agora's edge server.
  | 4 // 4: The SDK fails to join the channel for more than 20 minutes and stops reconnecting to the channel.
  | 5 // 5: The SDK has left the channel.
  | 6 // 6: Invalid App ID
  | 7 // 7: Invalid Channel Name
  | 8 // 8: Invalid Token
  | 9 // 9: Token Expired
  | 10 // 10: This user has been banned by server
  | 11 // 11: SDK reconnects for setting proxy server
  | 12 // 12: Network status change for renew token
  | 13; // 13: Client IP Address changed


/** @zh-cn
 * @deprecated 该枚举已废弃。
 * 视频属性。 */
/**
 * @deprecated Video profile.
 */
export enum VIDEO_PROFILE_TYPE {
  /** @zh-cn
   * 0：分辨率 160 × 120，帧率 15 fps，码率 65 Kbps。 
   */
  /** 0: 160 &times; 120, frame rate 15 fps, bitrate 65 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_120P = 0,
  /** @zh-cn
   * 2：分辨率 120 × 120，帧率 15 fps，码率 50 Kbps。
   */
  /** 2: 120 &times; 120, frame rate 15 fps, bitrate 50 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_120P_3 = 2,
  /** @zh-cn
   * 10：分辨率 320 × 180，帧率 15 fps，码率 140 Kbps。 
   */
  /** 10: 320&times;180, frame rate 15 fps, bitrate 140 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_180P = 10,
  /** @zh-cn
   * 12：分辨率 180 × 180，帧率 15 fps，码率 100 Kbps。 
   */
  /** 12: 180 &times; 180, frame rate 15 fps, bitrate 100 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_180P_3 = 12,
  /** @zh-cn
   * 13：分辨率 240 × 180，帧率 15 fps，码率 120 Kbps。 
   */
  /** 13: 240 &times; 180, frame rate 15 fps, bitrate 120 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_180P_4 = 13,
  /** @zh-cn
   * 20：分辨率 320 × 240，帧率 15 fps，码率 200 Kbps。 
   */
  /** 20: 320 &times; 240, frame rate 15 fps, bitrate 200 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_240P = 20,
  /** @zh-cn
   * 22：分辨率 240 × 240，帧率 15 fps，码率 140 Kbps。 
   */
  /** 22: 240 &times; 240, frame rate 15 fps, bitrate 140 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_240P_3 = 22,
  /** @zh-cn
   * 23：分辨率 424 × 240，帧率 15 fps，码率 220 Kbps。 
   */
  /** 23: 424 &times; 240, frame rate 15 fps, bitrate 220 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_240P_4 = 23,
  /** @zh-cn
   * 30：分辨率 640 × 360，帧率 15 fps，码率 400 Kbps。 
   */
  /** 30: 640 &times; 360, frame rate 15 fps, bitrate 400 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_360P = 30,
  /** @zh-cn
   * 32：分辨率 360 × 360，帧率 15 fps，码率 260 Kbps。 
   */
  /** 32: 360 &times; 360, frame rate 15 fps, bitrate 260 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_360P_3 = 32,
  /** @zh-cn
   * 33：分辨率 640 × 360，帧率 30 fps，码率 600 Kbps。 
   */
  /** 33: 640 &times; 360, frame rate 30 fps, bitrate 600 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_360P_4 = 33,
  /** @zh-cn
   * 35：分辨率 360 × 360，帧率 30 fps，码率 400 Kbps。 
   */
  /** 35: 360 &times; 360, frame rate 30 fps, bitrate 400 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_360P_6 = 35,
  /** @zh-cn
   * 36：分辨率 480 × 360，帧率 15 fps，码率 320 Kbps。 
   */
  /** 36: 480 &times; 360, frame rate 15 fps, bitrate 320 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_360P_7 = 36,
  /** @zh-cn
   * 37：分辨率 480 × 360，帧率 30 fps，码率 490 Kbps。 
   */
  /** 37: 480 &times; 360, frame rate 30 fps, bitrate 490 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_360P_8 = 37,
  /** @zh-cn
   * 38：分辨率 640 × 360，帧率 15 fps，码率 800 Kbps。
   * **Note**：该视频属性仅适用于直播频道模式。
   */
  /** @zh-cn
   * 38: 640 &times; 360, frame rate 15 fps, bitrate 800 Kbps.
   * **Note**: Live broadcast profile only.
   */
  VIDEO_PROFILE_LANDSCAPE_360P_9 = 38,
  /** @zh-cn
   * 39：分辨率 640 × 360，帧率 24 fps，码率 800 Kbps。
   * **Note**：该视频属性仅适用于直播频道模式。
   */
  /** @zh-cn
   * 39: 640 &times; 360, frame rate 24 fps, bitrate 800 Kbps.
   * **Note**: Live broadcast profile only.
   */
  VIDEO_PROFILE_LANDSCAPE_360P_10 = 39,
  /** @zh-cn
   * 100：分辨率 640 × 360，帧率 24 fps，码率 1000 Kbps。
   * **Note**：该视频属性仅适用于直播频道模式。
   */
  /** @zh-cn
   * 100: 640 &times; 360, frame rate 24 fps, bitrate 1000 Kbps.
   * **Note**: Live broadcast profile only.
   */
  VIDEO_PROFILE_LANDSCAPE_360P_11 = 100,
  /** @zh-cn
   * 40：分辨率 640 × 480，帧率 15 fps，码率 500 Kbps。 
   */
  /** 40: 640 &times; 480, frame rate 15 fps, bitrate 500 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_480P = 40,
  /** @zh-cn
   * 42：分辨率 480 × 480，帧率 15 fps，码率 400 Kbps。 
   */
  /** 42: 480 &times; 480, frame rate 15 fps, bitrate 400 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_480P_3 = 42,
  /** @zh-cn
   * 43：分辨率 640 × 480，帧率 30 fps，码率 750 Kbps。 
   */
  /** 43: 640 &times; 480, frame rate 30 fps, bitrate 750 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_480P_4 = 43,
  /** @zh-cn
   * 45：分辨率 480 × 480，帧率 30 fps，码率 600 Kbps。 
   */
  /** 45: 480 &times; 480, frame rate 30 fps, bitrate 600 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_480P_6 = 45,
  /** @zh-cn
   * 47：分辨率 848 × 480，帧率 15 fps，码率 610 Kbps。 
   */
  /** 47: 848 &times; 480, frame rate 15 fps, bitrate 610 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_480P_8 = 47,
  /** @zh-cn
   * 48：分辨率 848 × 480，帧率 30 fps，码率 930 Kbps。 
   */
  /** 48: 848 &times; 480, frame rate 30 fps, bitrate 930 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_480P_9 = 48,
  /** @zh-cn
   * 49：分辨率 640 × 480，帧率 10 fps，码率 400 Kbps。 
   */
  /** 49: 640 &times; 480, frame rate 10 fps, bitrate 400 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_480P_10 = 49,
  /** @zh-cn
   * 50：分辨率 1280 × 720，帧率 15 fps，码率 1130 Kbps。 
   */
  /** 50: 1280 &times; 720, frame rate 15 fps, bitrate 1130 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_720P = 50,
  /** @zh-cn
   * 52：分辨率 1280 × 720，帧率 30 fps，码率 1710 Kbps。 
   */
  /** 52: 1280 &times; 720, frame rate 30 fps, bitrate 1710 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_720P_3 = 52,
  /** @zh-cn
   * 54：分辨率 960 × 720，帧率 15 fps，码率 910 Kbps。 
   */
  /** 54: 960 &times; 720, frame rate 15 fps, bitrate 910 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_720P_5 = 54,
  /** @zh-cn
   * 55：分辨率 960 × 720，帧率 30 fps，码率 1380 Kbps。 
   */
  /** 55: 960 &times; 720, frame rate 30 fps, bitrate 1380 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_720P_6 = 55,
  /** @zh-cn
   * 60：分辨率 1920 × 1080，帧率 15 fps，码率 2080 Kbps。 
   */
  /** 60: 1920 &times; 1080, frame rate 15 fps, bitrate 2080 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_1080P = 60,
  /** @zh-cn
   * 62：分辨率 1920 × 1080，帧率 30 fps，码率 3150 Kbps。 
   */
  /** 62: 1920 &times; 1080, frame rate 30 fps, bitrate 3150 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_1080P_3 = 62,
  /** @zh-cn
   * 64：分辨率 1920 × 1080，帧率 60 fps，码率 4780 Kbps。 
   */
  /** 64: 1920 &times; 1080, frame rate 60 fps, bitrate 4780 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_1080P_5 = 64,
  /** @zh-cn
   * 66：分辨率 2560 × 1440，帧率 30 fps，码率 4850 Kbps。 
   */
  /** 66: 2560 &times; 1440, frame rate 30 fps, bitrate 4850 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_1440P = 66,
  /** @zh-cn
   * 67：分辨率 2560 × 1440，帧率 60 fps，
   * 码率 7350 Kbps。 
   */
  /** 67: 2560 &times; 1440, frame rate 60 fps, bitrate 6500 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_1440P_2 = 67,
  /** @zh-cn
   * 70：分辨率 3840 × 2160，分辨率 30 fps，码率 8910 Kbps。 
   */
  /** 70: 3840 &times; 2160, frame rate 30 fps, bitrate 6500 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_4K = 70,
  /** @zh-cn
   * 72：分辨率 3840 × 2160，帧率 60 fps，码率 13500 Kbps。 
   */
  /** 72: 3840 &times; 2160, frame rate 60 fps, bitrate 6500 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_4K_3 = 72,
  /** @zh-cn
   * 1000：分辨率 120 × 160，帧率 15 fps，码率 65 Kbps。 
   */
  /** 1000: 120 &times; 160, frame rate 15 fps, bitrate 65 Kbps. */
  VIDEO_PROFILE_PORTRAIT_120P = 1000,
  /** @zh-cn
   * 1002：分辨率 120 × 120，帧率 15 fps，码率 50 Kbps。 
   */
  /** 1002: 120 &times; 120, frame rate 15 fps, bitrate 50 Kbps. */
  VIDEO_PROFILE_PORTRAIT_120P_3 = 1002,
  /** @zh-cn
   * 1010：分辨率 180 × 320，帧率 15 fps，码率 140 Kbps。 */
  /** 1010: 180 &times; 320, frame rate 15 fps, bitrate 140 Kbps. */
  VIDEO_PROFILE_PORTRAIT_180P = 1010,
  /** @zh-cn
   * 1012：分辨率 180 × 180，帧率 15 fps，码率 100 Kbps。 */
  /** 1012: 180 &times; 180, frame rate 15 fps, bitrate 100 Kbps. */
  VIDEO_PROFILE_PORTRAIT_180P_3 = 1012,
  /** @zh-cn
   * 1013：分辨率 180 × 240，帧率 15 fps，码率 120 Kbps。 */
  /** 1013: 180 &times; 240, frame rate 15 fps, bitrate 120 Kbps. */
  VIDEO_PROFILE_PORTRAIT_180P_4 = 1013,
  /** @zh-cn
   * 1020：分辨率 240 × 320，帧率 15 fps，码率 200 Kbps。 */
  /** 1020: 240 &times; 320, frame rate 15 fps, bitrate 200 Kbps. */
  VIDEO_PROFILE_PORTRAIT_240P = 1020,
  /** @zh-cn
   * 1022：分辨率 240 × 240，帧率 15 fps，码率 140 Kbps。 */
  /** 1022: 240 &times; 240, frame rate 15 fps, bitrate 140 Kbps. */
  VIDEO_PROFILE_PORTRAIT_240P_3 = 1022,
  /** @zh-cn
   * 1023：分辨率 240 × 424，帧率 15 fps，码率 220 Kbps */
  /** 1023: 240 &times; 424, frame rate 15 fps, bitrate 220 Kbps. */
  VIDEO_PROFILE_PORTRAIT_240P_4 = 1023,
  /** @zh-cn
   * 1030：分辨率 360 × 640，帧率 15 fps，码率 400 Kbps */
  /** 1030: 360 &times; 640, frame rate 15 fps, bitrate 400 Kbps. */
  VIDEO_PROFILE_PORTRAIT_360P = 1030,
  /** @zh-cn
   * 1032：分辨率 360 × 360，帧率 15 fps，码率 260 Kbps。 */
  /** 1032: 360 &times; 360, frame rate 15 fps, bitrate 260 Kbps. */
  VIDEO_PROFILE_PORTRAIT_360P_3 = 1032,
  /** @zh-cn
   * 1033：分辨率 360 × 640，帧率 30 fps，码率 600 Kbps。 */
  /** 1033: 360 &times; 640, frame rate 30 fps, bitrate 600 Kbps. */
  VIDEO_PROFILE_PORTRAIT_360P_4 = 1033,
  /** @zh-cn
   * 1035：分辨率 360 × 360，帧率 30 fps，码率 400 Kbps。 */
  /** 1035: 360 &times; 360, frame rate 30 fps, bitrate 400 Kbps. */
  VIDEO_PROFILE_PORTRAIT_360P_6 = 1035,
  /** @zh-cn
   * 1036：分辨率 360 × 480，帧率 15 fps，码率 320 Kbps。 */
  /** 1036: 360 &times; 480, frame rate 15 fps, bitrate 320 Kbps. */
  VIDEO_PROFILE_PORTRAIT_360P_7 = 1036,
  /** @zh-cn
   * 1037：分辨率 360 × 480，帧率 30 fps，码率 490 Kbps。 */
  /** 1037: 360 &times; 480, frame rate 30 fps, bitrate 490 Kbps. */
  VIDEO_PROFILE_PORTRAIT_360P_8 = 1037,
  /** @zh-cn
   * 1038：分辨率 360 × 640，帧率 15 fps，码率 800 Kbps。
   * **Note**：该视频属性仅适用于直播频道模式。
   */
  /** 1038: 360 &times; 640, frame rate 15 fps, bitrate 800 Kbps.
   * **Note**: Live broadcast profile only.
   */
  VIDEO_PROFILE_PORTRAIT_360P_9 = 1038,
  /** @zh-cn
   * 1039：分辨率 360 × 640，帧率 24 fps，码率 800 Kbps。
   * **Note**：该视频属性仅适用于直播频道模式。
   */
  /** 1039: 360 &times; 640, frame rate 24 fps, bitrate 800 Kbps.
   * **Note**: Live broadcast profile only.
   */
  VIDEO_PROFILE_PORTRAIT_360P_10 = 1039,
  /** @zh-cn
   * 1100：分辨率 360 × 640，帧率 24 fps，码率 1000 Kbps。
   * **Note**： 该视频属性仅适用于直播频道模式。
   */
  /** 1100: 360 &times; 640, frame rate 24 fps, bitrate 1000 Kbps.
   * **Note**: Live broadcast profile only.
   */
  VIDEO_PROFILE_PORTRAIT_360P_11 = 1100,
  /** @zh-cn
   * 1040：分辨率 480 × 640，帧率 15 fps，码率 500 Kbps。 
   */
  /** 1040: 480 &times; 640, frame rate 15 fps, bitrate 500 Kbps. */
  VIDEO_PROFILE_PORTRAIT_480P = 1040,
  /** @zh-cn
   * 1042：分辨率 480 × 480，帧率 15 fps，码率 400 Kbps。 
   */
  /** 1042: 480 &times; 480, frame rate 15 fps, bitrate 400 Kbps. */
  VIDEO_PROFILE_PORTRAIT_480P_3 = 1042,
  /** @zh-cn
   * 1043：分辨率 480 × 640，帧率 30 fps，码率 750 Kbps。 
   */
  /** 1043: 480 &times; 640, frame rate 30 fps, bitrate 750 Kbps. */
  VIDEO_PROFILE_PORTRAIT_480P_4 = 1043,
  /** @zh-cn
   * 1045：分辨率 480 × 480，帧率 30 fps，码率 600 Kbps。 
   */
  /** 1045: 480 &times; 480, frame rate 30 fps, bitrate 600 Kbps. */
  VIDEO_PROFILE_PORTRAIT_480P_6 = 1045,
  /** @zh-cn
   * 1047：分辨率 480 × 848，帧率 15 fps，码率 610 Kbps。 
   */
  /** 1047: 480 &times; 848, frame rate 15 fps, bitrate 610 Kbps. */
  VIDEO_PROFILE_PORTRAIT_480P_8 = 1047,
  /** @zh-cn
   * 1048：分辨率 480 × 848，帧率 30 fps，码率 930 Kbps。 
   */
  /** 1048: 480 &times; 848, frame rate 30 fps, bitrate 930 Kbps. */
  VIDEO_PROFILE_PORTRAIT_480P_9 = 1048,
  /** @zh-cn
   * 1049：分辨率 480 × 640，帧率 10 fps，码率 400 Kbps。 
   */
  /** 1049: 480 &times; 640, frame rate 10 fps, bitrate 400 Kbps. */
  VIDEO_PROFILE_PORTRAIT_480P_10 = 1049,
  /** @zh-cn
   * 1050：分辨率 720 × 1280，帧率 15 fps，码率 1130 Kbps。 
   */
  /** 1050: 720 &times; 1280, frame rate 15 fps, bitrate 1130 Kbps. */
  VIDEO_PROFILE_PORTRAIT_720P = 1050,
  /** @zh-cn
   * 1052：分辨率 720 × 1280，帧率 30 fps，码率 1710 Kbps。 
   */
  /** 1052: 720 &times; 1280, frame rate 30 fps, bitrate 1710 Kbps. */
  VIDEO_PROFILE_PORTRAIT_720P_3 = 1052,
  /** @zh-cn
   * 1054：分辨率 720 × 960，帧率 15 fps，码率 910 Kbps。 
   */
  /** 1054: 720 &times; 960, frame rate 15 fps, bitrate 910 Kbps. */
  VIDEO_PROFILE_PORTRAIT_720P_5 = 1054,
  /** @zh-cn
   * 1055：分辨率 720 × 960，帧率 30 fps，码率 1380 Kbps。 
   */
  /** 1055: 720 &times; 960, frame rate 30 fps, bitrate 1380 Kbps. */
  VIDEO_PROFILE_PORTRAIT_720P_6 = 1055,
  /** @zh-cn
   * 1060：分辨率 1080 × 1920，帧率 15 fps，码率 2080 Kbps。 
   */
  /** 1060: 1080 &times; 1920, frame rate 15 fps, bitrate 2080 Kbps. */
  VIDEO_PROFILE_PORTRAIT_1080P = 1060,
  /** @zh-cn
   * 1062：分辨率 1080 × 1920，帧率 30 fps，码率 3150 Kbps。 
   */
  /** 1062: 1080 &times; 1920, frame rate 30 fps, bitrate 3150 Kbps. */
  VIDEO_PROFILE_PORTRAIT_1080P_3 = 1062,
  /** @zh-cn
   * 1064：分辨率 1080 × 1920，帧率 60 fps，码率 4780 Kbps。 
   */
  /** 1064: 1080 &times; 1920, frame rate 60 fps, bitrate 4780 Kbps. */
  VIDEO_PROFILE_PORTRAIT_1080P_5 = 1064,
  /** @zh-cn
   * 1066：分辨率 1440 × 2560，帧率 30 fps，码率 4850 Kbps。 
   */
  /** 1066: 1440 &times; 2560, frame rate 30 fps, bitrate 4850 Kbps. */
  VIDEO_PROFILE_PORTRAIT_1440P = 1066,
  /** @zh-cn
   * 1067：分辨率 1440 × 2560，帧率 60 fps，码率 6500 Kbps。 
   */
  /** 1067: 1440 &times; 2560, frame rate 60 fps, bitrate 6500 Kbps. */
  VIDEO_PROFILE_PORTRAIT_1440P_2 = 1067,
  /** @zh-cn
   * 1070：分辨率 2160 × 3840，分辨率 30 fps，码率 6500 Kbps。 
   */
  /** 1070: 2160 &times; 3840, frame rate 30 fps, bitrate 6500 Kbps. */
  VIDEO_PROFILE_PORTRAIT_4K = 1070,
  /** @zh-cn
   * 1072：分辨率 2160 × 3840，帧率 60 fps，码率 6500 Kbps。 
   */
  /** 1072: 2160 &times; 3840, frame rate 60 fps, bitrate 6500 Kbps. */
  VIDEO_PROFILE_PORTRAIT_4K_3 = 1072,
  /** @zh-cn
   * 默认视频属性：分辨率 640 × 360，帧率 15 fps，码率 400 Kbps。 
   */
  /** Default 640 &times; 360, frame rate 15 fps, bitrate 400 Kbps. */
  VIDEO_PROFILE_DEFAULT = VIDEO_PROFILE_LANDSCAPE_360P
}
/** @zh-cn
 * 频道信息。
 * 
 * - channel 频道名，默认值为 NULL，表示 SDK 填充当前的频道名。
 * - token 能加入频道的 Token，默认值为 NULL，表示 SDK 填充当前使用的 Token。
 * - uid 用户 ID。
 * 
 * **Note**：
 * 
 * 跨频道媒体流转发功能不支持 string 型用户 ID。
 */
/**
 * The definition of {@link ChannelMediaInfo}.
 * 
 * - channel: The channel name. The default value is NULL, which means that 
 * the SDK applies the current channel name.
 * 
 * - token: The token that enables the user to join the channel. 
 * The default value is NULL, which means that the SDK applies the current 
 * token.
 * 
 * - uid: The user ID.
 * 
 * **Note**: 
 * 
 * String user accounts are not supported in media stream relay.
 */
export interface ChannelMediaInfo {
  channel: string;
  token: string;
  uid: number;
}

/** @zh-cn
 * 跨频道媒体流转发参数配置
 * 
 * - srcInfo 源频道信息，详见 {@link ChannelMediaInfo}。
 * 
 * **Note**：
 * - uid 该 uid 为你想要转发流的用户的 ID。建议为 0，SDK 会转发当前主播的流。
 * - 如果你不使用 Token，我们建议使用 {@link ChannelMediaInfo} 中各参数的默认值。
 * - 如果你使用 Token，则将 UID 设为 0，并保证用于生成 Token 的 UID 也是 0。
 * 
 * - destInfos 目标频道信息，详见 {@link ChannelMediaInfo}。
 * 
 * **Warning**:
 * - 如果你想将流转发到多个目标频道，可以定义多个 {@link ChannelMediaInfo} 类（最多
 * 四个）。
 * 
 * **Note**：
 * - uid 在目标频道中的用户 ID。
 */
/**
 * The configuration of the media stream relay.
 * 
 * - srcInfo: The information of the destination channel:
 * {@link ChannelMediaInfo}.
 * 
 * **Note**:
 * - `uid`: ID of the user whose media stream you want to relay. 
 * We recommend setting it as 0, which means that the SDK relays the media 
 * stream of the current broadcaster.
 * - If you do not use a token, we recommend using the default values of the 
 * parameters in {@link ChannelMediaInfo}.
 * - If you use a token, set uid as 0, and ensure that the token is generated 
 * with the `uid` set as 0.
 * 
 * - destInfos: The information of the destination channel: 
 * {@link ChannelMediaInfo}.
 * 
 * **Warning**:
 * - If you want to relay the media stream to multiple channels, define as 
 * many {@link ChannelMediaInfo} interface (at most four).
 * 
 * **Note**:
 * - `uid`: The user ID in the destination channel.
 */

export interface ChannelMediaRelayConfiguration {
  srcInfo: ChannelMediaInfo;
  destInfos: [ChannelMediaInfo];
}
/** @zh-cn
 * 跨频道媒体流转发事件码
 * 
 * - 0 网络中断导致用户与服务器连接断开
 * - 1 用户与服务器建立连接
 * - 2 用户已加入源频道
 * - 3 用户已加入目标频道
 * - 4 SDK 开始向目标频道发送数据包
 * - 5 服务器收到了目标频道发送的视频流
 * - 6 服务器收到了目标频道发送的音频流
 * - 7 目标频道已更新
 * - 8 内部原因导致目标频道更新失败
 * - 9 目标频道未发生改变，即目标频道更新失败
 * - 10 目标频道名为 NULL
 * - 11 视频属性已发送至服务器
 */
/**
 * The event code.
 * - 0: The user disconnects from the server due to poor network connections.
 * - 1: The network reconnects.
 * - 2: The user joins the source channel.
 * - 3: The user joins the destination channel.
 * - 4: The SDK starts relaying the media stream to the destination channel.
 * - 5: The server receives the video stream from the source channel.
 * - 6: The server receives the audio stream from the source channel.
 * - 7: The destination channel is updated.
 * - 8: The destination channel update fails due to internal reasons.
 * - 9: The destination channel does not change, which means that the 
 * destination channel fails to be updated.
 * - 10: The destination channel name is NULL.
 * - 11: The video profile is sent to the server.
 */
export type ChannelMediaRelayEvent =
  | 0 // 0: RELAY_EVENT_NETWORK_DISCONNECTED
  | 1 // 1: RELAY_EVENT_NETWORK_CONNECTED
  | 2 // 2: RELAY_EVENT_PACKET_JOINED_SRC_CHANNEL
  | 3 // 3: RELAY_EVENT_PACKET_JOINED_DEST_CHANNEL
  | 4 // 4: RELAY_EVENT_PACKET_SENT_TO_DEST_CHANNEL
  | 5 // 5: RELAY_EVENT_PACKET_RECEIVED_VIDEO_FROM_SRC
  | 6 // 6: RELAY_EVENT_PACKET_RECEIVED_AUDIO_FROM_SRC
  | 7 // 7: RELAY_EVENT_PACKET_UPDATE_DEST_CHANNEL
  | 8 // 8: RELAY_EVENT_PACKET_UPDATE_DEST_CHANNEL_REFUSED
  | 9 // 9: RELAY_EVENT_PACKET_UPDATE_DEST_CHANNEL_NOT_CHANGE
  | 10 // 10: RELAY_EVENT_PACKET_UPDATE_DEST_CHANNEL_IS_NULL
  | 11; // 11: RELAY_EVENT_VIDEO_PROFILE_UPDATE
/** @zh-cn
 * 状态码：
 * - 0 SDK 正在初始化
 * - 1 SDK 尝试跨频道
 * - 2 源频道主播成功加入目标频道
 * - 3 发生异常，详见 {@link ChannelMediaRelayError} 中错误码
 */
/**
 * The state code.
 * - 0: The SDK is initializing.
 * - 1: The SDK tries to relay the media stream to the destination channel.
 * - 2: The SDK successfully relays the media stream to the destination 
 * channel.
 * - 3: A failure occurs. See the error code in 
 * {@link ChannelMediaRelayError}.
 */
export type ChannelMediaRelayState =
  | 0 // 0: RELAY_STATE_IDLE
  | 1 // 1: RELAY_STATE_CONNECTING
  | 2 // 2: RELAY_STATE_RUNNING
  | 3; // 3: RELAY_STATE_FAILURE

/** @zh-cn
 * 错误码：
 * - 0 一切正常
 * - 1 服务器回应出错
 * - 2 服务器无回应。你可以调用 {@link leaveChannel} 方法离开频道
 * - 3 SDK 无法获取服务，可能是因为服务器资源有限导致
 * - 4 服务器加入源频道失败
 * - 5 服务器加入目标频道失败
 * - 6 服务器未收到源频道发送的数据
 * - 7 服务器未收到源频道发送的数据
 * - 8 SDK 因网络质量不佳与服务器断开。你可以调用 {@link leaveChannel} 方法离开当前频道
 * - 9 服务器内部出错
 * - 10 源频道的 Token 已过期
 * - 11 目标频道的 Token 已过期
 */
/**
 * The error code.
 * - 0: The state is normal.
 * - 1: An error occurs in the server response.
 * - 2: No server response. You can call the {@link leaveChannel} method to 
 * leave the channel.
 * - 3: The SDK fails to access the service, probably due to limited resources 
 * of the server.
 * - 4: The server fails to join the source channel.
 * - 5: The server fails to join the destination channel.
 * - 6: The server fails to receive the data from the source channel.
 * - 7: The source channel fails to transmit data.
 * - 8: The SDK disconnects from the server due to poor network connections. 
 * You can call the {@link leaveChannel} method to leave the channel.
 * - 9: An internal error occurs in the server.
 * - 10: The token of the source channel has expired.
 * - 11: The token of the destination channel has expired.
 */
export type ChannelMediaRelayError =
  | 0 // 0: RELAY_OK
  | 1 // 1: RELAY_ERROR_SERVER_ERROR_RESPONSE
  | 2 // 2: RELAY_ERROR_SERVER_NO_RESPONSE
  | 3 // 3: RELAY_ERROR_NO_RESOURCE_AVAILABLE
  | 4 // 4: RELAY_ERROR_FAILED_JOIN_SRC
  | 5 // 5: RELAY_ERROR_FAILED_JOIN_DEST
  | 6 // 6: RELAY_ERROR_FAILED_PACKET_RECEIVED_FROM_SRC
  | 7 // 7: RELAY_ERROR_FAILED_PACKET_SENT_TO_DEST
  | 8 // 8: RELAY_ERROR_SERVER_CONNECTION_LOST
  | 9 // 9: RELAY_ERROR_INTERNAL_ERROR
  | 10 // 10: RELAY_ERROR_SRC_TOKEN_EXPIRED
  | 11; // 11: RELAY_ERROR_DEST_TOKEN_EXPIRED

/** @zh-cn
 * @ignore
 */
/**
 * interface for c++ addon (.node)
 * @ignore
 */
export interface NodeRtcEngine {
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  initialize(appId: string): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  getVersion(): string;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  getErrorDescription(errorCode: number): string;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  getConnectionState(): ConnectionState;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  joinChannel(
    token: string,
    channel: string,
    info: string,
    uid: number
  ): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  switchChannel(
    token: string,
    channel: string
  ): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  leaveChannel(): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  release(): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setHighQualityAudioParameters(
    fullband: boolean,
    stereo: boolean,
    fullBitrate: boolean
  ): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setupLocalVideo(): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  subscribe(uid: number): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setVideoRenderDimension(
    rendertype: number,
    uid: number,
    width: number,
    height: number
  ): void;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setFPS(fps: number): void;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setHighFPS(fps: number): void;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  addToHighVideo(uid: number): void;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  removeFromHighVideo(uid: number): void;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  renewToken(newToken: string): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setChannelProfile(profile: number): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setClientRole(role: ClientRoleType): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  startEchoTest(): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  stopEchoTest(): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  startEchoTestWithInterval(interval: number): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  enableLastmileTest(): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  disableLastmileTest(): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  startLastmileProbeTest(config: LastmileProbeConfig): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  stopLastmileProbeTest(): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  enableVideo(): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  disableVideo(): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  startPreview(): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  stopPreview(): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setVideoProfile(
    profile: VIDEO_PROFILE_TYPE,
    swapWidthAndHeight: boolean
  ): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setCameraCapturerConfiguration(config: CameraCapturerConfiguration): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setVideoEncoderConfiguration(
    config: VideoEncoderConfiguration
  ): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setBeautyEffectOptions(
    enable: boolean,
    options: {
      lighteningContrastLevel: 0 | 1 | 2; // 0 for low, 1 for normal, 2 for high
      lighteningLevel: number;
      smoothnessLevel: number;
      rednessLevel: number;
    }
  ): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setRemoteUserPriority(uid: number, priority: Priority): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  enableAudio(): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  disableAudio(): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setAudioProfile(profile: number, scenario: number): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setVideoQualityParameters(preferFrameRateOverImageQuality: boolean): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setEncryptionMode(mode: string): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setEncryptionSecret(secret: string): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  muteLocalAudioStream(mute: boolean): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  muteAllRemoteAudioStreams(mute: boolean): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setDefaultMuteAllRemoteAudioStreams(mute: boolean): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  muteRemoteAudioStream(uid: number, mute: boolean): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  muteLocalVideoStream(mute: boolean): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  enableLocalVideo(enable: boolean): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  enableLocalAudio(enable: boolean): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  muteAllRemoteVideoStreams(mute: boolean): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setDefaultMuteAllRemoteVideoStreams(mute: boolean): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  enableAudioVolumeIndication(interval: number, smooth: number): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  muteRemoteVideoStream(uid: number, mute: boolean): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setInEarMonitoringVolume(volume: number): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  pauseAudio(): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  resumeAudio(): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setLogFile(filepath: string): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setLogFileSize(size: number): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  videoSourceSetLogFile(filepath: string): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setLogFilter(filter: number): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  enableDualStreamMode(enable: boolean): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setRemoteVideoStreamType(uid: number, streamType: StreamType): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setRemoteDefaultVideoStreamType(streamType: StreamType): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  enableWebSdkInteroperability(enable: boolean): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setLocalVideoMirrorMode(mirrorType: 0 | 1 | 2): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setLocalVoicePitch(pitch: number): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setLocalVoiceEqualization(bandFrequency: number, bandGain: number): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setLocalVoiceReverb(reverbKey: number, value: number): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setLocalVoiceChanger(preset: VoiceChangerPreset): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setLocalVoiceReverbPreset(preset: AudioReverbPreset): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setLocalPublishFallbackOption(option: 0 | 1 | 2): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setRemoteSubscribeFallbackOption(option: 0 | 1 | 2): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setExternalAudioSource(
    enabled: boolean,
    samplerate: number,
    channels: number
  ): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  getVideoDevices(): Array<Object>;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setVideoDevice(deviceId: string): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  getCurrentVideoDevice(): Object;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  startVideoDeviceTest(): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  stopVideoDeviceTest(): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  getAudioPlaybackDevices(): Array<Object>;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setAudioPlaybackDevice(deviceId: string): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  getPlaybackDeviceInfo(deviceId: string, deviceName: string): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  getCurrentAudioPlaybackDevice(): Object;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setAudioPlaybackVolume(volume: number): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  getAudioPlaybackVolume(): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  getAudioRecordingDevices(): Array<Object>;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setAudioRecordingDevice(deviceId: string): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  getRecordingDeviceInfo(deviceId: string, deviceName: string): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  getCurrentAudioRecordingDevice(): Object;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  getAudioRecordingVolume(): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setAudioRecordingVolume(volume: number): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  startAudioPlaybackDeviceTest(filepath: string): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  stopAudioPlaybackDeviceTest(): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  enableLoopbackRecording(enable: boolean, deviceName: string | null): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  startAudioRecordingDeviceTest(indicateInterval: number): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  stopAudioRecordingDeviceTest(): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  startAudioDeviceLoopbackTest(interval: number): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  stopAudioDeviceLoopbackTest(): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  getAudioPlaybackDeviceMute(): boolean;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setAudioPlaybackDeviceMute(mute: boolean): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  getAudioRecordingDeviceMute(): boolean;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setAudioRecordingDeviceMute(mute: boolean): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  videoSourceInitialize(appId: string): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  videoSourceEnableWebSdkInteroperability(enabled: boolean): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  videoSourceJoin(
    token: string,
    cname: string,
    info: string,
    uid: number
  ): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  videoSourceLeave(): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  videoSourceRenewToken(token: string): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  videoSourceSetChannelProfile(profile: number): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  videoSourceSetVideoProfile(
    profile: VIDEO_PROFILE_TYPE,
    swapWidthAndHeight: boolean
  ): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  videosourceStartScreenCaptureByScreen(
    screenSymbol: ScreenSymbol,
    rect: CaptureRect,
    param: CaptureParam
  ): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  videosourceStartScreenCaptureByWindow(
    windowSymbol: number,
    rect: CaptureRect,
    param: CaptureParam
  ): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  videosourceUpdateScreenCaptureParameters(param: CaptureParam): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  videosourceSetScreenCaptureContentHint(hint: VideoContentHint): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  getScreenWindowsInfo(): Array<Object>;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  getScreenDisplaysInfo(): Array<Object>;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  startScreenCapture2(
    windowId: number,
    captureFreq: number,
    rect: { left: number; right: number; top: number; bottom: number },
    bitrate: number
  ): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  stopScreenCapture2(): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  videoSourceStartPreview(): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  videoSourceStopPreview(): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  videoSourceEnableDualStreamMode(enable: boolean): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  videoSourceSetParameter(parameter: string): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  videoSourceUpdateScreenCaptureRegion(rect: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  }): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  videoSourceRelease(): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  startScreenCapture(
    windowId: number,
    captureFreq: number,
    rect: { left: number; right: number; top: number; bottom: number },
    bitrate: number
  ): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  stopScreenCapture(): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  updateScreenCaptureRegion(rect: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  }): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  startAudioMixing(
    filepath: string,
    loopback: boolean,
    replace: boolean,
    cycle: number
  ): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  stopAudioMixing(): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  pauseAudioMixing(): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  resumeAudioMixing(): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  adjustAudioMixingVolume(volume: number): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  adjustAudioMixingPlayoutVolume(volume: number): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  adjustAudioMixingPublishVolume(volume: number): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  getAudioMixingDuration(): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  getAudioMixingCurrentPosition(): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  getAudioMixingPublishVolume(): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  getAudioMixingPlayoutVolume(): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setAudioMixingPosition(position: number): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  addPublishStreamUrl(url: string, transcodingEnabled: boolean): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  removePublishStreamUrl(url: string): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setLiveTranscoding(transcoding: TranscodingConfig): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  addInjectStreamUrl(url: string, config: InjectStreamConfig): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  removeInjectStreamUrl(url: string): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setRecordingAudioFrameParameters(
    sampleRate: number,
    channel: 1 | 2,
    mode: 0 | 1 | 2,
    samplesPerCall: number
  ): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setPlaybackAudioFrameParameters(
    sampleRate: number,
    channel: 1 | 2,
    mode: 0 | 1 | 2,
    samplesPerCall: number
  ): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setMixedAudioFrameParameters(
    sampleRate: number,
    samplesPerCall: number
  ): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  createDataStream(reliable: boolean, ordered: boolean): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  sendStreamMessage(streamId: number, msg: string): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  getEffectsVolume(): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setEffectsVolume(volume: number): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setVolumeOfEffect(soundId: number, volume: number): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  playEffect(
    soundId: number,
    filePath: string,
    loopcount: number,
    pitch: number,
    pan: number,
    gain: number,
    publish: number
  ): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  stopEffect(soundId: number): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  preloadEffect(soundId: number, filePath: string): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  unloadEffect(soundId: number): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  pauseEffect(soundId: number): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  pauseAllEffects(): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  resumeEffect(soundId: number): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  resumeAllEffects(): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  enableSoundPositionIndication(enable: boolean): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setRemoteVoicePosition(uid: number, pan: number, gain: number): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  getCallId(): string;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  rate(callId: string, rating: number, desc: string): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  complain(callId: string, desc: string): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setBool(key: string, value: boolean): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setInt(key: string, value: number): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setUInt(key: string, value: number): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setNumber(key: string, value: number): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setString(key: string, value: string): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setObject(key: string, value: string): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  getBool(key: string): boolean;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  getInt(key: string): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  getUInt(key: string): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  getNumber(key: string): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  getString(key: string): string;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  getObject(key: string): string;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  getArray(key: string): string;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setParameters(param: string): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  convertPath(path: string): string;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setProfile(profile: string, merge: boolean): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  onEvent(event: string, callback: Function): void;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  unsubscribe(uid: number): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  registerDeliverFrame(callback: Function): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  registerLocalUserAccount(appId: string, userAccount: string): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  joinChannelWithUserAccount(
    token: string,
    channel: string,
    userAccount: string
  ): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  getUserInfoByUserAccount(
    userAccount: string
  ): { errCode: number; userInfo: UserInfo };
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  getUserInfoByUid(uid: number): { errCode: number; userInfo: UserInfo };
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  adjustRecordingSignalVolume(volume: number): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  adjustPlaybackSignalVolume(volume: number): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  stopAllEffects(): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  startChannelMediaRelay(config: ChannelMediaRelayConfiguration): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  updateChannelMediaRelay(config: ChannelMediaRelayConfiguration): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  stopChannelMediaRelay(): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  initializePluginManager(): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  releasePluginManager(): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  getPlugins(): Array<{id: string}>;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  registerPlugin(pluginInfo: PluginInfo): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  unregisterPlugin(pluginId: string): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  enablePlugin(pluginId: string, enabled: boolean): number;
  /** @zh-cn
   * @ignore
   */
  /**
   * @ignore
   */
  setPluginParameter(pluginId: string, param: string): number;
}
