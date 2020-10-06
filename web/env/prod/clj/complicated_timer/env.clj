(ns complicated-timer.env
  (:require [clojure.tools.logging :as log]))

(def defaults
  {:init
   (fn []
     (log/info "\n-=[complicated-timer started successfully]=-"))
   :stop
   (fn []
     (log/info "\n-=[complicated-timer has shut down successfully]=-"))
   :middleware identity})
