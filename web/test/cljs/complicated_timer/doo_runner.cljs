(ns complicated-timer.doo-runner
  (:require [doo.runner :refer-macros [doo-tests]]
            [complicated-timer.core-test]))

(doo-tests 'complicated-timer.core-test)

