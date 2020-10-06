(ns user
  "Userspace functions you can run by default in your local REPL."
  (:require
   [complicated-timer.config :refer [env]]
    [clojure.pprint]
    [clojure.spec.alpha :as s]
    [expound.alpha :as expound]
    [mount.core :as mount]
    [complicated-timer.figwheel :refer [start-fw stop-fw cljs]]
    [complicated-timer.core :refer [start-app]]))

(alter-var-root #'s/*explain-out* (constantly expound/printer))

(add-tap (bound-fn* clojure.pprint/pprint))

(defn start
  "Starts application.
  You'll usually want to run this on startup."
  []
  (mount/start-without #'complicated-timer.core/repl-server))

(defn stop
  "Stops application."
  []
  (mount/stop-except #'complicated-timer.core/repl-server))

(defn restart
  "Restarts application."
  []
  (stop)
  (start))


