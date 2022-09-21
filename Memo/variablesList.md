# Variables list

-   From output:

    -   [PRB:0.000,0.000,0.000:0]  
        #prb_x#, #prb_y#,#prb_z#  
        optional according axis definition #prb_a#,#prb_b#,#prb_c#

    -   from ? report MPos:0.000,0.000,0.000,0.000,0.000,0.000  
        #pos_x#, #pos_y#, #pos_z#, #pos_a#, #pos_b#, #pos_c#,
        #pos_wx#, #pos_wy#, #pos_wz#, #pos_wa#, #pos_wb#, #pos_wc#,  
        optional according axis definition #pos_u#,#pos_v#,#pos_w#, #pos_wu#,#pos_wv#,#pos_ww#

Note: if variable is unknown, then it is set to `0`

-   From UI

    -   Probe Panel  
        Probe thickness : #probe_thickness#  
        Selected axis : #selected_axis#

    -   Laser CNC Panel  
        Maximum value of laser: #laser_max#
