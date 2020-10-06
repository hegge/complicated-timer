(ns complicated-timer.env
  (:require
    [selmer.parser :as parser]
    [clojure.tools.logging :as log]
    [complicated-timer.dev-middleware :refer [wrap-dev]]))

(def defaults
  {:init
   (fn []
     (parser/cache-off!)
     (log/info "\n-=[complicated-timer started successfully using the development profile]=-"))
   :stop
   (fn []
     (log/info "\n-=[complicated-timer has shut down successfully]=-"))
   :middleware wrap-dev})
