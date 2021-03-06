Timer app written in React Native, heavily inspired by Complex Timer.


Session format
--------------

```
[{
    "name": "4x4 :3'",
    "description": "Fixed length intervals",
    "entries": [{
        "type": "repeat",
        "repetitions": 4,
        "group": [{
            "type": "countdown",
            "category": "work",
            "duration": 240
        },
        {
            "type": "countdown",
            "category": "pause",
            "duration": 180
        },
        {
            "type": "countdown" / "timer",
            "category": "work" / "pause" / "prepare",
            "duration": time_in_seconds
        },
        {
            "type": "repeat",
            "repetitions": 4,
            "group": [{
                "type": "countdown",
                "category": "pause",
                "skip": [1,2,-1],
                "pauseWhenComplete": true,
                "duration": 240
            },
            {
                "type": "countdown",
                "category": "work",
                "duration": 180
            }]
        }]
    }]
},
{
    "name": "3x7 x7" :3"/3'",
    "description": "Intermittent dead-hangs",
    "entries": ...
},
{
    "name": "2x3 x10" :3'",
    "description": "Max weight dead-hangs",
    "entries": ...
}]
```



App development environment
-----------------------

Dependencies:

* Android Studio
* node

VSCode plugins:

* Jest

Ensure at least one Android emulator is set up in AVD Manager

From the `app/` folder run

> npm install
> npx react-native start
> npx react-native run-android


Web development environment
-----------------------

Dependencies

* leiningen

From the root folder folder run

> lein run
> lein figwheel
