Agora Electron SDK 基于 Agora SDK for macOS 和 Agora SDK for Windows，使用 Node.js C++ 插件开发，是一个为 Electron 平台用户服务的开源 SDK。 通过声网全球部署的虚拟网络，提供可以灵活搭配的 API 组合，在各平台提供质量可靠的实时音视频通信。

* `AgoraRtcEngine` 接口类包含应用程序调用的主要方法。
* `Events` 接口类用于向应用程序发表事件回调通知。

## 方法类

### 频道管理

| 方法                                                         | 描述                                 |
| ------------------------------------------------------------ | ------------------------------------ |
| {@link AgoraRtcEngine.initialize initialize}                 | 初始化 `AgoraRtcEngine` 实例         |
| {@link AgoraRtcEngine.release release}                       | 释放 `AgoraRtcEngine` 实例           |
| {@link AgoraRtcEngine.setChannelProfile setChannelProfile}   | 设置频道模式                         |
| {@link AgoraRtcEngine.setClientRole setClientRole}           | 设置直播场景下的用户角色             |
| {@link AgoraRtcEngine.joinChannel joinChannel}               | 加入频道                             |
| {@link AgoraRtcEngine.switchChannel switchChannel}           | 快速切换直播频道|
| {@link AgoraRtcEngine.leaveChannel leaveChannel}             | 离开频道                             |
| {@link AgoraRtcEngine.subscribe subscribe}                   | 订阅远端用户并初始化视频渲染         |
| {@link AgoraRtcEngine.renewToken renewToken}                 | 更新 Token                           |
| {@link AgoraRtcEngine.enableWebSdkInteroperability enableWebSdkInteroperability} | 打开与 Agora Web SDK 的互通          |
| {@link AgoraRtcEngine.getConnectionState getConnectionState} | 获取网络连接状态                     |
| {@link AgoraRtcEngine.on on}                                 | 监听 `AgoraRtcEngine` 运行时的事件   |
| {@link AgoraRtcEngine.off off}                               | 取消监听 `AgoraRtcEngine` 运行时的事件 |


### 音频管理

| 方法                                                         | 描述                       |
| ------------------------------------------------------------ | -------------------------- |
| {@link AgoraRtcEngine.enableAudio enableAudio}               | 启用音频模块               |
| {@link AgoraRtcEngine.disableAudio disableAudio}             | 关闭音频模块               |
| {@link AgoraRtcEngine.setAudioProfile setAudioProfile}       | 设置音频编码配置           |
| {@link AgoraRtcEngine.adjustRecordingSignalVolume adjustRecordingSignalVolume}       | 调节录音音量           |
| {@link AgoraRtcEngine.adjustPlaybackSignalVolume adjustPlaybackSignalVolume}       | 调节播放人声的音量     |
| {@link AgoraRtcEngine.enableLocalAudio enableLocalAudio}     | 开关本地音频采集           |
| {@link AgoraRtcEngine.muteLocalAudioStream muteLocalAudioStream} | 停止/恢复发送本地音频流    |
| {@link AgoraRtcEngine.muteRemoteAudioStream muteRemoteAudioStream} | 停止/恢复接收指定音频流    |
| {@link AgoraRtcEngine.muteAllRemoteAudioStreams muteAllRemoteAudioStreams} | 停止/恢复接收所有音频流    |
| {@link AgoraRtcEngine.setDefaultMuteAllRemoteAudioStreams setDefaultMuteAllRemoteAudioStreams} | 设置是否默认接收所有音频流 |


### 视频管理

| 方法                                                         | 描述                       |
| ------------------------------------------------------------ | -------------------------- |
| {@link AgoraRtcEngine.enableVideo enableVideo}               | 启用视频模块               |
| {@link AgoraRtcEngine.disableVideo disableVideo}             | 关闭视频模块               |
| {@link AgoraRtcEngine.setVideoEncoderConfiguration setVideoEncoderConfiguration} | 设置视频编码配置           |
| {@link AgoraRtcEngine.setupLocalVideo setupLocalVideo}       | 设置本地视图               |
| {@link AgoraRtcEngine.setupViewContentMode setupViewContentMode} | 设置视窗模式               |
| {@link AgoraRtcEngine.setRenderMode setRenderMode}           | 设置视图显示模式           |
| {@link AgoraRtcEngine.startPreview startPreview}             | 开启视频预览               |
| {@link AgoraRtcEngine.stopPreview stopPreview}               | 停止视频预览               |
| {@link AgoraRtcEngine.enableLocalVideo enableLocalVideo}     | 开关本地视频采集           |
| {@link AgoraRtcEngine.muteLocalVideoStream muteLocalVideoStream} | 停止/恢复发送本地视频流    |
| {@link AgoraRtcEngine.muteRemoteVideoStream muteRemoteVideoStream} | 停止/恢复接收指定视频流    |
| {@link AgoraRtcEngine.muteAllRemoteVideoStreams muteAllRemoteVideoStreams} | 停止/恢复接收所有视频流    |
| {@link AgoraRtcEngine.setDefaultMuteAllRemoteVideoStreams setDefaultMuteAllRemoteVideoStreams} | 设置是否默认接收所有视频流 |

### 视频渲染

| 方法                                                         | 描述                 |
| ------------------------------------------------------------ | -------------------- |
| {@link AgoraRtcEngine.initRender initRender}                 | 初始化渲染器         |
| {@link AgoraRtcEngine.destroyRender destroyRender}           | 销毁渲染器           |
| {@link AgoraRtcEngine.resizeRender resizeRender}             | 调整视频渲染尺寸     |
| {@link AgoraRtcEngine.setVideoRenderDimension setVideoRenderDimension} | 设置视频渲染的分辨率 |
| {@link AgoraRtcEngine.setVideoRenderFPS setVideoRenderFPS}   | 设置视频渲染的帧率   |
| {@link AgoraRtcEngine.setVideoRenderHighFPS setVideoRenderHighFPS} | 设置高帧率渲染视频流 |
| {@link AgoraRtcEngine.addVideoRenderToHighFPS addVideoRenderToHighFPS} | 添加高帧率渲染视频流 |
| {@link AgoraRtcEngine.removeVideoRenderFromHighFPS  removeVideoRenderFromHighFPS} | 移除高帧率渲染视频流 |

### 视频前处理及后处理

| 方法                                                         | 描述             |
| ------------------------------------------------------------ | ---------------- |
| {@link AgoraRtcEngine.setBeautyEffectOptions setBeautyEffectOptions} | 设置美颜设置选项 |

### 屏幕共享

| 方法                                                         | 描述                  |
| ------------------------------------------------------------ | --------------------- |
| {@link AgoraRtcEngine.getScreenDisplaysInfo getScreenDisplaysInfo} | 获取屏幕信息  |
| {@link AgoraRtcEngine.getScreenWindowsInfo getScreenWindowsInfo} | 获取窗口信息 |
| {@link AgoraRtcEngine.startScreenCapture startScreenCapture} | 通过窗口信息共享屏幕|
| {@link AgoraRtcEngine.stopScreenCapture stopScreenCapture} | 停止共享屏幕 |
| {@link AgoraRtcEngine.updateScreenCaptureRegion updateScreenCaptureRegion} | 更新屏幕共享区域 |

### 音乐文件播放管理

| 方法                                                         | 描述                       |
| ------------------------------------------------------------ | -------------------------- |
| {@link AgoraRtcEngine.startAudioMixing startAudioMixing}     | 开始播放音乐文件           |
| {@link AgoraRtcEngine.stopAudioMixing stopAudioMixing}       | 停止播放音乐文件           |
| {@link AgoraRtcEngine.pauseAudioMixing pauseAudioMixing}     | 暂停播放音乐文件           |
| {@link AgoraRtcEngine.resumeAudioMixing resumeAudioMixing}   | 恢复播放音乐文件           |
| {@link AgoraRtcEngine.adjustAudioMixingVolume adjustAudioMixingVolume} | 调节音乐文件的播放音量     |
| {@link AgoraRtcEngine.adjustAudioMixingPlayoutVolume adjustAudioMixingPlayoutVolume} | 调节音乐文件的本地播放音量 |
| {@link AgoraRtcEngine.adjustAudioMixingPublishVolume adjustAudioMixingPublishVolume} | 调节音乐文件的远端播放音量     |
| {@link AgoraRtcEngine.getAudioMixingPlayoutVolume getAudioMixingPlayoutVolume} | 获取音乐文件的本地播放音量 |
| {@link AgoraRtcEngine.getAudioMixingPublishVolume getAudioMixingPublishVolume} | 获取音乐文件的远端播放音量 |
| {@link AgoraRtcEngine.getAudioMixingDuration getAudioMixingDuration} | 获取音乐文件的播放时长     |
| {@link AgoraRtcEngine.getAudioMixingCurrentPosition getAudioMixingCurrentPosition} | 获取音乐文件的播放进度     |
| {@link AgoraRtcEngine.setAudioMixingPosition setAudioMixingPosition} | 设置音乐文件的播放位置     |

### 音效文件播放管理

| 方法                                                       | 描述                           |
| ---------------------------------------------------------- | ------------------------------ |
| {@link AgoraRtcEngine.getEffectsVolume getEffectsVolume}   | 获取音效文件的播放音量         |
| {@link AgoraRtcEngine.setEffectsVolume setEffectsVolume}   | 设置音效文件的播放音量         |
| {@link AgoraRtcEngine.setVolumeOfEffect setVolumeOfEffect} | 设置单个音效文件的播放音量     |
| {@link AgoraRtcEngine.playEffect playEffect}               | 播放指定的音效文件             |
| {@link AgoraRtcEngine.stopEffect stopEffect}               | 停止播放指定的音效文件         |
| {@link AgoraRtcEngine.preloadEffect preloadEffect}         | 将音效文件预加载至内存         |
| {@link AgoraRtcEngine.unloadEffect unloadEffect}           | 从内存释放某个预加载的音效文件 |
| {@link AgoraRtcEngine.pauseEffect pauseEffect}             | 暂停播放指定的音效文件         |
| {@link AgoraRtcEngine.pauseAllEffects pauseAllEffects}     | 暂停播放所有音效文件           |
| {@link AgoraRtcEngine.resumeEffect resumeEffect}           | 恢复播放指定的音效文件         |
| {@link AgoraRtcEngine.resumeAllEffects resumeAllEffects}   | 恢复播放所有音效文件           |

### 变声与混响

| 方法                                                         | 描述                       |
| ------------------------------------------------------------ | -------------------------- |
| {@link AgoraRtcEngine.setLocalVoiceChanger setLocalVoiceChanger} | 设置本地语音变声           |
| {@link AgoraRtcEngine.setLocalVoiceReverbPreset setLocalVoiceReverbPreset} | 设置预设的本地语音混响效果 |
| {@link AgoraRtcEngine.setLocalVoicePitch setLocalVoicePitch} | 设置本地语音音调           |
| {@link AgoraRtcEngine.setLocalVoiceEqualization setLocalVoiceEqualization} | 设置本地语音音效均衡       |
| {@link AgoraRtcEngine.setLocalVoiceReverb setLocalVoiceReverb} | 设置本地语音混响           |

### 听声辨位

| 方法                                                         | 描述                          |
| ------------------------------------------------------------ | ----------------------------- |
| {@link AgoraRtcEngine.enableSoundPositionIndication enableSoundPositionIndication} | 开启/关闭远端用户的语音立体声 |
| {@link AgoraRtcEngine.setRemoteVoicePosition setRemoteVoicePosition} | 设置远端用户的语音位置        |

### CDN 推流（仅适用于互动直播）

| 方法                                                         | 描述             |
| ------------------------------------------------------------ | ---------------- |
| {@link AgoraRtcEngine.setLiveTranscoding setLiveTranscoding} | 设置直播转码配置 |
| {@link AgoraRtcEngine.addPublishStreamUrl addPublishStreamUrl} | 增加旁路推流地址 |
| {@link AgoraRtcEngine.removePublishStreamUrl removePublishStreamUrl} | 删除旁路推流地址 |

### 跨频道媒体流转发（仅适用于互动直播）

| 方法                                                         | 描述             |
| ------------------------------------------------------------ | ---------------- |
| {@link AgoraRtcEngine.startChannelMediaRelay startChannelMediaRelay} | 开始跨频道媒体流转发 |
| {@link AgoraRtcEngine.updateChannelMediaRelay updateChannelMediaRelay} | 更新媒体流转发的频道 |
| {@link AgoraRtcEngine.stopChannelMediaRelay stopChannelMediaRelay} | 停止跨频道媒体流转发 |

### 音量提示

| 方法                                                         | 描述               |
| ------------------------------------------------------------ | ------------------ |
| {@link AgoraRtcEngine.enableAudioVolumeIndication enableAudioVolumeIndication} | 启用说话者音量提示 |

### 耳返控制

| 方法                                                         | 描述         |
| ------------------------------------------------------------ | ------------ |
| {@link AgoraRtcEngine.setInEarMonitoringVolume setInEarMonitoringVolume} | 设置耳返音量 |

### 视频双流模式

| 方法                                                         | 描述                     |
| ------------------------------------------------------------ | ------------------------ |
| {@link AgoraRtcEngine.enableDualStreamMode enableDualStreamMode} | 开启视频双流模式         |
| {@link AgoraRtcEngine.setRemoteVideoStreamType setRemoteVideoStreamType} | 设置订阅的视频流类型     |
| {@link AgoraRtcEngine.setRemoteDefaultVideoStreamType setRemoteDefaultVideoStreamType} | 设置默认订阅的视频流类型 |

### 音视频回退（仅适用于互动直播）

| 方法                                                         | 描述                                 |
| ------------------------------------------------------------ | ------------------------------------ |
| {@link AgoraRtcEngine.setLocalPublishFallbackOption setLocalPublishFallbackOption} | 设置弱网条件下发布的音视频流回退选项 |
| {@link AgoraRtcEngine.setRemoteSubscribeFallbackOption setRemoteSubscribeFallbackOption} | 设置弱网条件下订阅的音视频流回退选项 |
| {@link AgoraRtcEngine.setRemoteUserPriority setRemoteUserPriority} | 设置远端用户媒体流的优先级               |

### 通话前网络测试

| 方法                                                         | 描述                                             |
| ------------------------------------------------------------ | ------------------------------------------------ |
| {@link AgoraRtcEngine.startEchoTestWithInterval startEchoTestWithInterval} | 开始语音通话回路测试，并根据间隔时间返回测试结果 |
| {@link AgoraRtcEngine.stopEchoTest stopEchoTest}             | 停止语音通话回路测试                             |
| {@link AgoraRtcEngine.enableLastmileTest enableLastmileTest} | 启用网络测试                                     |
| {@link AgoraRtcEngine.disableLastmileTest disableLastmileTest} | 关闭网络测试                                     |
| {@link AgoraRtcEngine.startLastmileProbeTest startLastmileProbeTest} | 开始通话前网络质量探测                           |
| {@link AgoraRtcEngine.stopLastmileProbeTest stopLastmileProbeTest} | 停止通话前网络质量探测                           |


### 加密

| 方法                                                         | 描述                         |
| ------------------------------------------------------------ | ---------------------------- |
| {@link AgoraRtcEngine.setEncryptionSecret setEncryptionSecret} | 启用内置加密，并设置加密密码 |
| {@link AgoraRtcEngine.setEncryptionMode setEncryptionMode} | 设置内置的加密方案 |

### 导入在线媒体流（仅适用于互动直播）

| 方法                                                         | 描述                 |
| ------------------------------------------------------------ | -------------------- |
| {@link AgoraRtcEngine.addInjectStreamUrl addInjectStreamUrl} | 导入在线媒体流 URL   |
| {@link AgoraRtcEngine.removeInjectStreamUrl removeInjectStreamUrl} | 删除导入的在线媒体流 |

### 设备管理

| 方法                                                         | 描述                       |
| ------------------------------------------------------------ | -------------------------- |
| {@link AgoraRtcEngine.setAudioPlaybackDevice setAudioPlaybackDevice} | 设置音频播放设备           |
| {@link AgoraRtcEngine.getAudioPlaybackDevices getAudioPlaybackDevices} | 获取音频播放设备           |
| {@link AgoraRtcEngine.setAudioRecordingDevice setAudioRecordingDevice} | 设置音频录制设备           |
| {@link AgoraRtcEngine.getAudioRecordingDevices getAudioRecordingDevices} | 获取音频录制设备           |
| {@link AgoraRtcEngine.setVideoDevice setVideoDevice}         | 设置视频设备               |
| {@link AgoraRtcEngine.getVideoDevices getVideoDevices}       | 获取视频设备               |
| {@link AgoraRtcEngine.setAudioPlaybackDeviceMute setAudioPlaybackDeviceMute} | 设置音频播放设备静音       |
| {@link AgoraRtcEngine.getAudioPlaybackDeviceMute getAudioPlaybackDeviceMute} | 获取音频播放设备静音状态   |
| {@link AgoraRtcEngine.setAudioRecordingDeviceMute setAudioRecordingDeviceMute} | 设置音频录制设备静音       |
| {@link AgoraRtcEngine.getAudioRecordingDeviceMute getAudioRecordingDeviceMute} | 获取音频录制设备静音状态  |
| {@link AgoraRtcEngine.getPlaybackDeviceInfo getPlaybackDeviceInfo} | 获取播放设备信息          |
| {@link AgoraRtcEngine.getRecordingDeviceInfo getRecordingDeviceInfo} | 获取录制设备信息          |
| {@link AgoraRtcEngine.getCurrentAudioPlaybackDevice getCurrentAudioPlaybackDevice} | 获取当前的音频播放设备 |
| {@link AgoraRtcEngine.getCurrentAudioRecordingDevice getCurrentAudioRecordingDevice} | 获取当前的音频录制设备 |
| {@link AgoraRtcEngine.getCurrentVideoDevice getCurrentVideoDevice} | 获取当前的视频设备         |
| {@link AgoraRtcEngine.startAudioDeviceLoopbackTest startAudioDeviceLoopbackTest} | 开始音频设备回路测试       |
| {@link AgoraRtcEngine.stopAudioDeviceLoopbackTest stopAudioDeviceLoopbackTest} | 停止音频设备回路测试       |
| {@link AgoraRtcEngine.startAudioPlaybackDeviceTest startAudioPlaybackDeviceTest} | 开始音频播放设备测试       |
| {@link AgoraRtcEngine.stopAudioPlaybackDeviceTest stopAudioPlaybackDeviceTest} | 停止音频播放设备测试       |
| {@link AgoraRtcEngine.startAudioRecordingDeviceTest startAudioRecordingDeviceTest} | 开始音频录制设备测试       |
| {@link AgoraRtcEngine.stopAudioRecordingDeviceTest stopAudioRecordingDeviceTest} | 停止音频录制设备测试       |
| {@link AgoraRtcEngine.startVideoDeviceTest startVideoDeviceTest} | 开始视频设备测试           |
| {@link AgoraRtcEngine.stopVideoDeviceTest stopVideoDeviceTest} | 停止视频设备测试           |
| {@link AgoraRtcEngine.setAudioPlaybackVolume setAudioPlaybackVolume} | 设置音频播放设备的音量           |
| {@link AgoraRtcEngine.getAudioPlaybackVolume getAudioPlaybackVolume} | 获取音频播放设备的音量           |
| {@link AgoraRtcEngine.setAudioRecordingVolume setAudioRecordingVolume} | 设置录音设备的音量 |
| {@link AgoraRtcEngine.getAudioRecordingVolume getAudioRecordingVolume} | 获取录音设备的音量 |

### 流消息

| 方法                                                       | 描述       |
| ---------------------------------------------------------- | ---------- |
| {@link AgoraRtcEngine.createDataStream createDataStream}   | 创建数据流 |
| {@link AgoraRtcEngine.sendStreamMessage sendStreamMessage} | 发送数据流 |

### 其他音频控制

| 方法                                                         | 描述         |
| ------------------------------------------------------------ | ------------ |
| {@link AgoraRtcEngine.enableLoopbackRecording enableLoopbackRecording} | 开启声卡采集 |

### 其他视频控制

| 方法                                                         | 描述                 |
| ------------------------------------------------------------ | -------------------- |
| {@link AgoraRtcEngine.setLocalVideoMirrorMode setLocalVideoMirrorMode} | 设置本地视频镜像模式 |
| {@link AgoraRtcEngine.setCameraCapturerConfiguration setCameraCapturerConfiguration} | 设置摄像头的采集偏好 |

### 其他方法

| 方法                                                         | 描述               |
| ------------------------------------------------------------ | ------------------ |
| {@link AgoraRtcEngine.getCallId getCallId}                   | 获取通话 ID        |
| {@link AgoraRtcEngine.rate rate}                             | 给通话评分         |
| {@link AgoraRtcEngine.complain complain}                     | 投诉通话质量       |
| {@link AgoraRtcEngine.setLogFile setLogFile}                 | 设置日志文件       |
| {@link AgoraRtcEngine.setLogFileSize setLogFileSize}         | 设置日志文件大小       |
| {@link AgoraRtcEngine.setLogFile setLogFilter}               | 设置日志过滤等级       |
| {@link AgoraRtcEngine.getVersion getVersion}                 | 查询 SDK 版本号    |
| {@link AgoraRtcEngine.getErrorDescription getErrorDescription} | 获取警告或错误描述 |

### 定制方法

| 方法                                               | 描述                                          |
| -------------------------------------------------- | --------------------------------------------- |
| {@link AgoraRtcEngine.setParameters setParameters} | 通过 JSON 配置 SDK 提供技术预览或特别定制功能 |

### 双实例方法

Agora Electron SDK 提供双实例的实现方法。第二个实例用以屏幕共享，请调用下表中的方法实现对应功能。

| 方法                                                         | 描述                        |
| ------------------------------------------------------------ | --------------------------- |
| {@link AgoraRtcEngine.videoSourceInitialize videoSourceInitialize} | 初始化 `videoSource` 对象               |
| {@link AgoraRtcEngine.videoSourceRelease videoSourceRelease}       | 释放 `videoSource` 对象         |
| {@link AgoraRtcEngine.videoSourceSetLogFile videoSourceSetLogFile}     | 设置日志文件                   |
| {@link AgoraRtcEngine.videoSourceSetChannelProfile videoSourceSetChannelProfile} | 设置频道模式      |
| {@link AgoraRtcEngine.setupLocalVideoSource setupLocalVideoSource} | 设置 `videoSource` 的渲染器     |
| {@link AgoraRtcEngine.videoSourceJoin videoSourceJoin} | 加入频道 |
| {@link AgoraRtcEngine.videoSourceLeave videoSourceLeave} | 离开频道              |
| {@link AgoraRtcEngine.videoSourceRenewToken videoSourceRenewToken} | 更新 Token        |
| {@link AgoraRtcEngine.videoSourceEnableWebSdkInteroperability videoSourceEnableWebSdkInteroperability} | 开启与 Web SDK 互通      |
| {@link AgoraRtcEngine.getScreenDisplaysInfo getScreenDisplaysInfo} |     获取屏幕信息         |
| {@link AgoraRtcEngine.getScreenWindowsInfo getScreenWindowsInfo}       |   获取窗口信息            |
| {@link AgoraRtcEngine.videoSourceStartScreenCaptureByScreen videoSourceStartScreenCaptureByScreen}     |    通过屏幕信息共享屏幕        |
| {@link AgoraRtcEngine.videoSourceStartScreenCaptureByWindow videoSourceStartScreenCaptureByWindow} |       通过窗口信息共享屏幕       |
| {@link AgoraRtcEngine.videoSourceSetVideoProfile videoSourceSetVideoProfile} | 设置视频属性      |
| {@link AgoraRtcEngine.stopScreenCapture2 stopScreenCapture2} | 停止共享屏幕 |
| {@link AgoraRtcEngine.startScreenCapturePreview startScreenCapturePreview} |   开启预览共享屏幕      |
| {@link AgoraRtcEngine.stopScreenCapturePreview stopScreenCapturePreview} |       停止预览共享屏幕   |
| {@link AgoraRtcEngine.videoSourceUpdateScreenCaptureRegion videoSourceUpdateScreenCaptureRegion} |  更新共享区域|
| {@link AgoraRtcEngine.videoSourceUpdateScreenCaptureParameters videoSourceUpdateScreenCaptureParameters} |   更新共享屏幕的编码配置       |
| {@link AgoraRtcEngine.videoSourceSetScreenCaptureContentHint videoSourceSetScreenCaptureContentHint} |   设置共享屏幕的内容类型       |
| {@link AgoraRtcEngine.videoSourceEnableDualStreamMode videoSourceEnableDualStreamMode}     |     开启屏幕共享流的双流模式     |
| {@link AgoraRtcEngine.videoSourceSetParameters videoSourceSetParameters} |     双实例方法：启用定制功能          |


## 事件类

Agora Electron SDK 通过 {@link AgoraRtcEngine.on on} 方法监听上述方法触发的事件。

| 事件                             | 描述                                     |
| -------------------------------- | ---------------------------------------- |
| `warning`                          | 发生警告                                 |
| `error`                            | 发生错误                                 |
| `joinedChannel`                    | 已加入频道                               |
| `rejoinedChannel`                  | 已重新加入频道                           |
| `leaveChannel`                     | 已离开频道                               |
| `clientRoleChanged`                | 用户角色已改变                           |
| `userJoined`                       | 远端用户已加入频道                       |
| `connectionStateChanged`           | 网络连接状态已改变                       |
| `connectionLost`                   | 网络连接已丢失                           |
| `apiCallExecuted`                  | API 方法已执行                           |
| `tokenPrivilegeWillExpire`         | Token 即将过期                           |
| `requestChannelKey`                | Channel Key 已过期                       |
| `localUserRegistered`              | 本地用户已注册 User account              |
| `userInfoUpdated`                  | 远端用户信息已更新                       |
| `groupAudioVolumeIndication`       | 提示频道内谁正在说话以及说话者音量       |
| `activeSpeaker`                    | 监测到活跃用户                           |
| `rtcStats`                         | 报告当前通话统计信息                     |
| `localVideoStats`                  | 报告本地视频流统计信息                   |
| `remoteVideoStats`                 | 报告远端视频流统计信息                   |
| `localAudioStats`                  | 报告通话中本地音频流统计信息|
| `remoteAudioStats`                 | 报告通话中远端音频流的统计信息           |
| `audioDeviceStateChanged`          | 音频设备状态发生改变                     |
| `videoDeviceStateChanged`          | 视频文件状态发生改变事件                 |
| `audioMixingStateChanged`          | 本地音乐文件播放状态已改变               |
| `remoteAudioMixingBegin`           | 远端音乐文件播放已开始                   |
| `remoteAudioMixingEnd`             | 远端音乐文件播放已结束                   |
| `audioEffectFinished`              | 本地音效文件播放已结束                   |
| `networkQuality`                   | 报告网络上下行质量                       |
| `lastmileQuality`                  | 报告通话前本地用户的网络质量             |
| `lastmileProbeResult`              | 报告通话前Last-mile 网络上下行质量       |
| `firstLocalAudioFrame`             | 已发送本地音频首帧                       |
| `firstRemoteAudioFrame`            | 已收到远端音频首帧                       |
| `firstRemoteAudioDecoded`            | 已解码远端音频首帧                       |
| `firstLocalVideoFrame`             | 已显示本地视频首帧                       |
| `firstRemoteVideoFrame`            | 已显示远端视频首帧                       |
| `videoSizeChanged`                 | 本地或远端视频大小或旋转信息发生改变     |
| `removeStream`                    | 远端用户已离开频道                       |
| `userMuteAudio`                    | 远端用户已暂停/重新发送音频流            |
| `userMuteVideo`                    | 远端用户已暂停/重新发送视频流            |
| `cameraReady`                      | 摄像头已启用                             |
| `videoStopped`                     | 视频功能已停止                           |
| `streamMessage`                    | 接收到对方数据流小                       |
| `streamMessageError`               | 接收对方数据流消息发生错误               |
| `audioDeviceVolumeChanged`         | 音频设备播放音量已改变                   |
| `localAudioStateChanged`           | 本地音频状态改变回调|
| `remoteAudioStateChanged`          | 远端用户音频状态已改变回调|
| `localVideoStateChanged`           | 本地视频状态已改变                       |
| `remoteVideoStateChanged`          | 远端视频状态已改变                       |
| `cameraFocusAreaChanged`           | 摄像头对焦区域已改变                     |
| `cameraExposureAreaChanged`        | 摄像头曝光区域已改变                     |
| `streamPublished`                  | 已添加旁路推流地址                       |
| `streamUnpublished`                | 已移除旁路推流地址                       |
| `transcodingUpdated`               | 旁路推流配置已更新                       |
| `channelMediaRelayState`   |跨频道媒体流转发状态发生改变回调|
| `channelMediaRelayEvent`           |跨频道媒体流转发事件回调|
| `streamInjectStatus`               | 导入在线媒体流状态                       |
| `localPublishFallbackToAudioOnly`  | 本地发布流已回退为音频流或恢复为音视频流 |
| `remoteSubscribeFallbackToAudioOnly` | 远端订阅流已回退为音频流或恢复为音视频流 |
| `videoSourceJoinedSuccess`         | （第二个实例）已加入频道                 |
| `videoSourceRequestNewToken`       | （第二个实例）Token 已过期               |
| `videoSourceLeaveChannel`          | （第二个实例）已离开频道                 |


<a name = "warn"></a>
## 警告码

警告代码意味着 Agora Electron SDK 遇到问题，但有可能恢复，警告代码仅起告知作用，一般情况下应用程序可以忽略警告代码。

| 警告码 | 描述                                                         |
| ------ | ------------------------------------------------------------ |
| `8`      | 指定的 view 无效。<br>使用视频功能时需要指定 view，如果 view 尚未指定，则返回该警告。 |
| `16`     | 初始化视频功能失败。<br/>用户无法看到视频画面，但不影响语音通信。<br>有可能是视频资源被占用导致的。 |
| `20`     | 请求处于待定状态。<br>一般是由于某个模块还没准备好，请求被延迟处理。 |
| `103`    | 没有可用的频道资源。<br>可能是因为服务端没法分配频道资源。   |
| `104`    | 查找频道超时。<br>在加入频道时 SDK 先要查找指定的频道，出现该警告一般是因为网络太差，连接不到服务器。 |
| `105`    | **DEPRECATED** 请改用 `ConnectionChangeReason` 中的 `10`。 <br/>查找频道请求被服务器拒绝。<br/>服务器可能没有办法处理这个请求或请求是非法的。 |
| `106`    | 打开频道超时。<br/>查找到指定频道后，SDK 接着打开该频道，超时一般是因为网络太差，连接不到服务器。 |
| `107`    | 服务器拒绝打开频道请求。<br/>服务器可能没有办法处理该请求或该请求是非法的。 |
| `111`    | 切换直播视频超时。                                           |
| `118`    | 直播场景下设置用户角色超时。                                 |
| `119`    | 直播场景下用户角色未授权。                                   |
| `121`    | TICKET 非法，打开频道失败。                                  |
| `122`    | 尝试打开另一个服务器。                                       |
| `701`    | 打开伴奏出错。                                               |
| `1014`   | 音频设备模块：运行时播放设备出现警告。                       |
| `1016`   | 音频设备模块：运行时录音设备出现警告。                       |
| `1019`   | 音频设备模块：没有采集到有效的声音数据。                     |
| `1020`   | 音频设备模块：播放设备故障。                                 |
| `1021`   | 音频设备模块：录音设备故障。                                 |
| `1025`   | 通话或直播被系统声音打断，比如电话、闹钟等。                 |
| `1031`   | 音频设备模块：录到的声音太低。                               |
| `1032`   | 音频设备模块：播放的声音太低。                               |
| `1040`   | 音频设备模块：音频驱动异常。<br/>解决方案：禁用并重新启用音频设备，或者重启机器，或者更新声卡驱动 |
| `1051`   | 音频设备模块：录音声音监测到啸叫。                           |
| `1052`   | 音频设备模块：音频播放会卡顿。                               |
| `1053`   | 音频设备模块：音频底层设置被修改。                           |
| `1323`   | 音频设备模块：无可用音频播放设备。<br/>解决方案：插入音频设备 |
| `1324`   | 音频设备模块：音频采集释放有误。<br/>解决方案：禁用并重新启用音频设备，或者重启机器，或者更新声卡驱动。 |
| `1610`   | 超分告警：远端用户的原始视频流的分辨率超出了可以应用超分辨率算法的要求。 |
| `1611`   | 超分告警：已指定一个远端用户使用超分辨率算法。               |
| `1612`   | 超分告警：当前设备不支持超分算法。                           |


<a name = "error"></a>
## 错误码

错误代码意味着 Agora Electron SDK 遭遇不可恢复的错误，需要应用程序干预，例如打开摄像头失败会返回错误，应用程序需要提示用户不能使用摄像头。

| 错误码 | 描述                                                         |
| ------ | ------------------------------------------------------------ |
| `0`      | 没有错误。                                                   |
| `1`      | 一般性的错误（没有明确归类的错误原因）。                     |
| `2`      | 使用了无效的参数。例如指定的频道名含有非法字符。             |
| `3`      | RTC 引擎初始化失败。<br/>解决方法：<li>检查音频设备状态。</li><li>检查程序集完整性。</li><li>尝试重新初始化 RTC 引擎。 </li> |
| `4`      | RTC 引擎当前状态不支持此项操作。                             |
| `5`      | 调用被拒绝。 |
| `6`      | 传入的缓冲区大小不足以存放返回的数据。                       |
| `7`      | SDK 尚未初始化就调用其 API。<br/>请确认在调用 API 之前已创建 AgoraRtcEngine 对象并完成初始化。 |
| `9`      | 没有操作权限。<br/>请检查用户是否授予音视频设备使用权限。 |
| `10`     | API 调用超时。<br/>有些 API 调用需要 SDK 返回结果，如果 SDK 处理事件过长，超过 10 秒没有返回，会出现此错误。 |
| `11`     | 请求被取消。<br/>仅供 SDK 内部使用，不通过 API 或者回调事件返回给 App。 |
| `12`     | 调用频率太高。<br/>仅供 SDK 内部使用，不通过 API 或者回调事件返回给 App。 |
| `13`     | SDK 内部绑定到网络 Socket 失败。<br/>仅供 SDK 内部使用，不通过 API 或者回调事件返回给 App。 |
| `14`     | 网络不可用。<br/>仅供 SDK 内部使用，不通过 API 或者回调事件返回给 App。 |
| `15`     | 没有网络缓冲区可用。<br/>仅供 SDK 内部使用，不通过 API 或者回调事件返回给 App。 |
| `17`     | 加入频道被拒绝。一般有以下原因：<li>用户已进入频道，再次调用加入频道的 API，例如 `joinChannel` ，会返回此错误。停止调用该方法即可。</li><li>用户在做 Echo 测试时尝试加入频道。等待 Echo test 结束后再加入频道即可。 </li> |
| `18`     | 离开频道失败。一般有以下原因：<li>用户已离开频道，再次调用退出频道的 API，例如 `leaveChannel`，会返回此错误。停止调用该方法即可。</li><li>用户尚未加入频道，就调用退出频道的 API。这种情况下无需额外操作。</li> |
| `19`     | 资源已被占用，不能重复使用。                                 |
| `20`     | SDK 放弃请求，可能由于请求次数太多。                         |
| `21`     | Windows 下特定的防火墙设置导致 SDK 初始化失败然后崩溃。      |
| `22`     | 当用户 App 占用资源过多，或系统资源耗尽时，SDK 分配资源失败会返回该错误。 |
| `101`    | 不是有效的 App ID。<br/>请更换有效的 App ID 重新加入频道。   |
| `102`    | 不是有效的频道名。<br/>请更换有效的频道名重新加入频道。      |
| `109`    | **DEPRECATED** 请改用 `ConnectionChangeReason` 中的 `9`。<br/>当前使用的 Token 过期，不再有效。一般有以下原因：<br/><li>Token 授权时间戳无效：Token 授权时间戳为 Token 生成时的时间戳，自 1970 年 1 月 1 日开始到当前时间的描述。授权该 Token 在生成后的 24 小时内可以访问 Agora 服务。如果 24 小时内没有访问，则该 Token 无法再使用。需要重新在服务端申请生成 Token。</li><li>Token 服务到期时间戳已过期：用户设置的服务到期时间戳小于当前时间戳，无法继续使用 Agora 服务（比如正在进行的通话会被强制终止）；设置服务到期时间并不意味着 Token 失效，而仅仅用于限制用户使用当前服务的时间。需要重新在服务端申请生成 Token。 </li> |
| `110`    | **DEPRECATED** 请改用 `ConnectionChangeReason` 中的 `8`。<br/>生成的 Token 无效，一般有以下原因：<br/><li>用户在 Console 上启用了 App Certificate，但仍旧在代码里仅使用了 App ID。当启用了 App Certificate，必须使用 Token。</li><li>字段 `uid` 为生成 Token 的必须字段，用户在调用 `joinChannel` 加入频道时必须设置相同的 `uid`。 </li> |
| `113`    | 用户不在频道内。<br/>调用 `sendStreamMessage`，当调用发生在频道外时，会发生该错误. |
| `114`    | 调用 `sendStreamMessage`，当发送的数据长度大于 1024 个字节时，会发生该错误。 |
| `115`    | 调用 `sendStreamMessage`，当发送的数据频率超过限制时（6 KB/s），会发生该错误。 |
| `116`    | 调用 `createDataStream`，如果创建的数据通道过多（超过 5 个），会发生该错误。 |
| `117`    | 数据流发送超时。                                             |
| `119`    | 切换角色失败。<br/>请尝试重新加入频道。                      |
| `120`    | 解密失败，可能是用户加入频道用了不同的密码。<br/>请检查加入频道时的设置，或尝试重新加入频道。 |
| `123`    | 此用户被服务器禁止。                                         |
| `124`    | 水印文件参数错误。                                           |
| `125`    | 水印文件路径错误。                                           |
| `126`    | 水印文件格式错误。                                           |
| `127`    | 水印文件信息错误。                                           |
| `128`    | 水印文件数据格式错误。                                       |
| `129`    | 水印文件读取错误。                                           |
| `130`    | 调用 `addPublishStreamUrl` 时，如果开启了加密，则会返回该错误(推流不支持加密流)。 |
| `134`    | 无效的 User Account。                                        |
| `151`    | CDN 相关错误。<br/>请调用 `removePublishStreamUrl` 删除原来的推流地址，然后调用 `addPublishStreamUrl` 重新推流到新地址。 |
| `152`    | 单个主播的推流地址数目达到上限 10。<br/>请删掉一些不用的推流地址再增加推流地址。 |
| `153`    | 操作不属于主播自己的流，如更新其他主播的流参数、停止其他主播的流。<br/>请检查 App 逻辑。 |
| `154`    | 推流服务器出现错误。<br/>请调用 `addPublishStreamUrl` 重新推流。 |
| `155`    | 服务器无法找到数据流。                                       |
| `156`    | 推流地址格式有错误。<br/>请检查推流地址格式是否正确。          |
| `1001`   | 加载媒体引擎失败。                                           |
| `1002`   | 启动媒体引擎开始通话失败。<br/>请尝试重新进入频道。          |
| `1003`   | **DEPRECATED** 请改用 `localVideoStateChanged` 回调中的 `error (4)`。<br/>启动摄像头失败，请检查摄像头是否被其他应用占用，或者尝试重新进入频道。 |
| `1004`   | 启动视频渲染模块失败。                                       |
| `1005`   | 音频设备模块：音频设备出现错误（未明确指明为何种错误）。<br/>请检查音频设备是否被其他应用占用，或者尝试重新进入频道。 |
| `1006`   | 音频设备模块：使用 Java 资源出现错误。                       |
| `1007`   | 音频设备模块：设置的采样频率出现错误。                       |
| `1008`   | 音频设备模块：初始化播放设备出现错误。<br/>请检查播放设备是否被其他应用占用，或者尝试重新进入频道。 |
| `1009`   | 音频设备模块：启动播放设备出现错误。<br/>请检查播放设备是否正常，或者尝试重新进入频道。 |
| `1010`   | 音频设备模块：停止播放设备出现错误。                         |
| `1011`   | 音频设备模块：初始化录音设备时出现错误。<br/>请检查录音设备是否正常，或者尝试重新进入频道。 |
| `1012`   | 音频设备模块：启动录音设备出现错误。<br/>请检查录音设备是否正常，或者尝试重新进入频道。 |
| `1013`   | 音频设备模块：停止录音设备出现错误。                         |
| `1015`   | 音频设备模块：运行时播放出现错误。<br/>请检查播放设备是否正常，或者尝试重新进入频道。 |
| `1017`   | 音频设备模块：运行时录音错误。<br/>请检查录音设备是否正常，或者尝试重新进入频道。 |
| `1018`   | 音频设备模块：录音失败。                                     |
| `1020`   | 音频设备模块：回放频率异常。                                 |
| `1021`   | 音频设备模块：录制频率异常。                                 |
| `1022`   | 音频设备模块：初始化 Loopback 设备错误。                     |
| `1023`   | 音频设备模块：启动 Loopback 设备错误。                       |
| `1027`   | 音频设备模块：没有录音权限。<br/>请检查是否已经打开权限允许录音。 |
| `1033`   | 音频设备模块：录制设备被占用。                               |
| `1301`   | 音频设备模块：音频驱动异常或者兼容性问题。<br/>解决方案：禁用并重新启用音频设备，或者重启机器。 |
| `1303`   | 音频设备模块：音频驱动异常或者兼容性问题。<br/>解决方案：禁用并重新启用音频设备，或者重启机器。 |
| `1306`   | 音频设备模块：音频驱动异常或者兼容性问题。<br/>解决方案：禁用并重新启用音频设备，或者重启机器。 |
| `1307`   | 音频设备模块：无可用音频设备。<br/>解决方案：插入音频设备。  |
| `1309`   | 音频设备模块：音频驱动异常或者兼容性问题。<br/>解决方案：禁用并重新启用音频设备，或者重启机器。 |
| `1311`   | 音频设备模块：系统内存不足或者机器性能较差。<br/>解决方案：重启机器或者更换机器。 |
| `1314`   | 音频设备模块：音频驱动异常。<br/>解决方案：禁用并重新启用音频设备，或者重启机器，或者更新声卡驱动。 |
| `1319`   | 音频设备模块：系统内存不足或者机器性能较差。<br/>解决方案：重启机器或者更换机器。 |
| `1320`   | 音频设备模块：音频驱动异常。<br/>解决方案：禁用并重新启用音频设备，或者重启机器，或者更新声卡驱动。 |
| `1322`   | 音频设备模块：无可用音频采集设备。<br/>解决方案：插入音频设备。 |
| `1323`   | 音频设备模块：无可用音频播放设备。<br/>解决方案：插入音频设备。 |
| `1351`   | 音频设备模块：音频驱动异常或者兼容性问题。<br/>解决方案：禁用并重新启用音频设备，或者重启机器，或者更新声卡驱动。 |
| `1353`   | 音频设备模块：音频驱动异常。<br/>解决方案：禁用并重新启用音频设备，或者重启机器，或者更新声卡驱动。 |
| `1354`   | 音频设备模块：音频驱动异常。<br/>解决方案：禁用并重新启用音频设备，或者重启机器，或者更新声卡驱动。 |
| `1355`   | 音频设备模块：音频驱动异常。<br/>解决方案：禁用并重新启用音频设备，或者重启机器，或者更新声卡驱动。 |
| `1356`   | 音频设备模块：音频驱动异常。<br/>解决方案：禁用并重新启用音频设备，或者重启机器，或者更新声卡驱动。 |
| `1357`   | 音频设备模块：音频驱动异常。<br/>解决方案：禁用并重新启用音频设备，或者重启机器，或者更新声卡驱动。 |
| `1358`   | 音频设备模块：音频驱动异常。<br/>解决方案：禁用并重新启用音频设备，或者重启机器，或者更新声卡驱动。 |
| `1359`   | 音频设备模块：无录制设备。<br/>请检查是否有可用的录放音设备或者录放音设备是否已经被其他应用占用。 |
| `1360`   | 音频设备模块：无播放设备。                                   |
| `1501`   | 视频设备模块：没有摄像头使用权限。<br/>请检查是否已经打开摄像头权限。 |
| `1502`   | **DEPRECATED** 请改用 `localVideoStateChanged` 回调中的 `error (3)`。<br/> 视频设备模块：摄像头正在使用中。 |
| `1600`   | 视频设备模块：未知错误。                                     |
| `1601`   | 视频设备模块：视频编码器初始化错误。<br/>该错误为**严重**错误，请尝试重新加入频道。 |
| `1602`   | 视频设备模块：视频编码器错误。<br/>该错误为**严重**错误，请尝试重新加入频道。 |
| `1603`   | 视频设备模块：视频编码器设置错误。                           |
